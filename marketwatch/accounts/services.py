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
        
        # 1. Determine exchange based on prefix/suffix or default
        if base_symbol.endswith('.NS'):
            exchange = "NSE"
        elif base_symbol.endswith('.BO'):
            exchange = "BSE"
        else:
            exchange = "NYSE/NASDAQ"
            
        # 2. Attempt fetching with the symbol as provided
        try:
            stock = yf.Ticker(base_symbol)
            hist = stock.history(period="2d")
            
            # 3. Fallback: If no data found and no suffix was given, try appending .NS for Indian markets
            if hist.empty and exchange == "NYSE/NASDAQ":
                fallback_symbol = f"{base_symbol}.NS"
                stock = yf.Ticker(fallback_symbol)
                hist = stock.history(period="2d")
                if not hist.empty:
                    base_symbol = fallback_symbol
                    exchange = "NSE"

            # 4. Process pricing if history is successfully retrieved
            if not hist.empty:
                # Handle edge case where only 1 day of history is returned
                if len(hist) >= 2:
                    prev_close = float(hist['Close'].iloc[-2])
                else:
                    prev_close = float(hist['Open'].iloc[0])
                    
                current_price = float(hist['Close'].iloc[-1])
                change = current_price - prev_close
                p_change = (change / prev_close) * 100 if prev_close != 0 else 0.0

                watchlist_data.append({
                    "symbol": base_symbol,
                    "exchange": exchange,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "pChange": round(p_change, 2)
                })
            else:
                logger.warning(f"No market data found for ticker: {base_symbol}")
                
        except Exception as e:
            logger.error(f"Error fetching data for {base_symbol}: {str(e)}")
            continue
            
    return watchlist_data