import yfinance as yf
from datetime import date, timedelta

def get_historical_ohlc(symbol, days=30):
    """
    Fetches historical OHLC data for both US and Indian stocks.
    Features a smart fallback to auto-detect NSE Indian stocks.
    """
    # Just clean up the string, don't force '.NS' here!
    base_symbol = symbol.strip().upper()
    
    start_date = (date.today() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    try:
        # 1. Try fetching exactly what the user typed (Works for US stocks like 'AAPL')
        stock = yf.Ticker(base_symbol)
        df = stock.history(start=start_date)
        
        # 2. SMART FALLBACK: If empty, and it doesn't already end in .NS, try the Indian market
        if df.empty and not base_symbol.endswith('.NS') and not base_symbol.endswith('.BO'):
            fallback_symbol = f"{base_symbol}.NS"
            stock_fallback = yf.Ticker(fallback_symbol)
            df_fallback = stock_fallback.history(start=start_date)
            
            # If the fallback worked, use that data instead!
            if not df_fallback.empty:
                df = df_fallback
                
        # If both attempts failed, return empty
        if df.empty:
            return []

        chart_data = []
        for index, row in df.iterrows():
            chart_data.append({
                "time": index.strftime("%Y-%m-%d"), 
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
            })
            
        return chart_data
        
    except Exception as e:
        print(f"Error fetching data for {base_symbol}: {e}")
        return []

def get_watchlist_prices(symbols):
    """
    Fetches the current price, absolute change, and percentage change 
    for a list of symbols to populate the watchlist UI.
    """
    watchlist_data = []
    
    for symbol in symbols:
        base_symbol = symbol.strip().upper()
        try:
            # Smart Fallback (US first, then India)
            stock = yf.Ticker(base_symbol)
            hist = stock.history(period="2d") # Fetch last 2 days to calculate change
            exchange = "NYSE/NASDAQ"
            
            if hist.empty and not base_symbol.endswith('.NS') and not base_symbol.endswith('.BO'):
                stock = yf.Ticker(f"{base_symbol}.NS")
                hist = stock.history(period="2d")
                exchange = "NSE"
                
            if not hist.empty:
                if len(hist) >= 2:
                    prev_close = float(hist['Close'].iloc[-2])
                    current_price = float(hist['Close'].iloc[-1])
                else:
                    prev_close = float(hist['Open'].iloc[0])
                    current_price = float(hist['Close'].iloc[0])
                    
                change = current_price - prev_close
                p_change = (change / prev_close) * 100
                
                watchlist_data.append({
                    "symbol": base_symbol,
                    "exchange": exchange,
                    "price": current_price,
                    "change": change,
                    "pChange": p_change
                })
        except Exception as e:
            print(f"Error fetching summary for {base_symbol}: {e}")
            
    return watchlist_data