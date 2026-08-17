import yfinance as yf
import logging

logger = logging.getLogger(__name__)

def get_watchlist_prices(symbols):
    watchlist_data = []
    
    if not symbols:
        return watchlist_data

    for symbol in symbols:
        raw_symbol = symbol.strip()
        base_symbol = raw_symbol.upper()
        
        # Determine exchange label and formatting
        if base_symbol.endswith('.NS'):
            exchange = "NSE"
            search_symbols = [base_symbol]
        elif base_symbol.endswith('.BO'):
            exchange = "BSE"
            search_symbols = [base_symbol]
        else:
            # For US stocks or raw inputs, try exact match first, then auto-fallback to .NS and .BO
            exchange = "NYSE/NASDAQ"
            search_symbols = [base_symbol, f"{base_symbol}.NS", f"{base_symbol}.BO"]

        hist = None
        resolved_symbol = base_symbol

        for s in search_symbols:
            try:
                stock = yf.Ticker(s)
                temp_hist = stock.history(period="2d")
                if not temp_hist.empty:
                    hist = temp_hist
                    resolved_symbol = s
                    if s.endswith('.NS'):
                        exchange = "NSE"
                    elif s.endswith('.BO'):
                        exchange = "BSE"
                    break
            except Exception:
                continue

        if hist is not None and not hist.empty:
            try:
                if len(hist) >= 2:
                    prev_close = float(hist['Close'].iloc[-2])
                else:
                    prev_close = float(hist['Open'].iloc[0])
                    
                current_price = float(hist['Close'].iloc[-1])
                change = current_price - prev_close
                p_change = (change / prev_close) * 100 if prev_close != 0 else 0.0

                watchlist_data.append({
                    "symbol": resolved_symbol,
                    "exchange": exchange,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "pChange": round(p_change, 2)
                })
            except Exception as e:
                logger.error(f"Error calculating prices for {resolved_symbol}: {str(e)}")
        else:
            logger.warning(f"No market data found for ticker: {base_symbol}")
            
    return watchlist_data


def get_historical_ohlc(symbol, period="1mo", interval="1d"):
    try:
        base_symbol = symbol.strip().upper()
        search_symbols = [base_symbol]
        
        if not base_symbol.endswith(('.NS', '.BO')):
            search_symbols = [base_symbol, f"{base_symbol}.NS", f"{base_symbol}.BO"]

        hist = None
        for s in search_symbols:
            stock = yf.Ticker(s)
            temp_hist = stock.history(period=period, interval=interval)
            if not temp_hist.empty:
                hist = temp_hist
                break

        if hist is None or hist.empty:
            return []

        data = []
        for date, row in hist.iterrows():
            data.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        return data
    except Exception as e:
        logger.error(f"Error fetching historical OHLC for {symbol}: {str(e)}")
        return []