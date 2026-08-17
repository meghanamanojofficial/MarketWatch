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
    watchlist_data = []
    
    for symbol in symbols:
        base_symbol = symbol.strip().upper()
        
        # 1. Determine the label based on the symbol provided
        if base_symbol.endswith('.NS'):
            exchange = "NSE"
        elif base_symbol.endswith('.BO'):
            exchange = "BSE"
        else:
            exchange = "NYSE/NASDAQ" # Default for unknown/US
            
        # 2. Try fetching the data
        stock = yf.Ticker(base_symbol)
        hist = stock.history(period="2d")
        
        # 3. If empty and wasn't already NSE/BSE, try auto-appending .NS
        if hist.empty and exchange == "NYSE/NASDAQ":
            base_symbol = f"{base_symbol}.NS"
            stock = yf.Ticker(base_symbol)
            hist = stock.history(period="2d")
            exchange = "NSE"
            
        # 4. Proceed with price calculation
        if not hist.empty:
            # (Keep your existing price math logic here)
            prev_close = float(hist['Close'].iloc[-2]) if len(hist) >= 2 else float(hist['Open'].iloc[0])
            current_price = float(hist['Close'].iloc[-1])
            
            watchlist_data.append({
                "symbol": base_symbol,
                "exchange": exchange,
                "price": current_price,
                "change": current_price - prev_close,
                "pChange": ((current_price - prev_close) / prev_close) * 100
            })
            
    return watchlist_data