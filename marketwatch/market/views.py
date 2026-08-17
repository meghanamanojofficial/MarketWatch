from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Watchlist
import yfinance as yf

class WatchlistViewSet(viewsets.ModelViewSet):
    # ... serializer class setup omitted for brevity
    
    def get_queryset(self):
        # Strict scoping: Users only see their own watchlist
        return Watchlist.objects.filter(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        market_data = []
        
        for item in queryset:
            stock = yf.Ticker(item.ticker)
            hist = stock.history(period="1d")
            current_price = hist['Close'].iloc[-1] if not hist.empty else 0
            
            market_data.append({
                "id": item.id,
                "ticker": item.ticker,
                "current_price": round(current_price, 2)
            })
            
        return Response(market_data)