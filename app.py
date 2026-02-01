import yfinance as yf
from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

STOCKS_ETF = {
    "1": "GLD",   # gold etf
    "2": "QQQ",   # Nasdaq
    "3": "RBLX",   # roblox
    "4": "USO",   # oil etf
    "5": "XRT",   # retail etf
    "6": "VHT",  # healthcare etf
}

price_cache = {}
last_fetch_time = 0
CACHE_DURATION = 15 # seconds

@app.route('/prices', methods=['GET'])
def get_prices():
    global last_fetch_time, price_cache
    
    current_time = time.time()
    
    # Return cached data if recent
    if current_time - last_fetch_time < CACHE_DURATION and price_cache:
        return jsonify(price_cache)
    
    # Fetch fresh data
    prices = {}
    for stock_id, ticker in STOCKS_ETF.items():
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period='1d')
            if not hist.empty:
                prices[stock_id] = {
                    'currentPrice': round(hist['Close'].iloc[-1], 2),
                    'basePrice': round(hist['Open'].iloc[0], 2)
                }
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")
            # Fallback to previous price if available
            if stock_id in price_cache:
                prices[stock_id] = price_cache[stock_id]
    
    price_cache = prices
    last_fetch_time = current_time
    
    return jsonify(prices)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
