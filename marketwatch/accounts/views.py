from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Stock, Watchlist
from .services import get_historical_ohlc, get_watchlist_prices

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # Allows anyone to access this endpoint
    serializer_class = RegisterSerializer

class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        watchlist, _ = Watchlist.objects.get_or_create(user=request.user)
        # Get the raw list of strings from the database
        symbols = [stock.symbol for stock in watchlist.stocks.all()]
        
        # Pass them through our new pricing engine
        enriched_watchlist = get_watchlist_prices(symbols)
        
        return Response({"watchlist": enriched_watchlist}, status=status.HTTP_200_OK)

class WatchlistActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get('symbol').upper()
        # Get or create the stock in the DB
        stock, created = Stock.objects.get_or_create(symbol=symbol)

        watchlist, _ = Watchlist.objects.get_or_create(user=request.user)
        watchlist.stocks.add(stock)
        return Response({"message": f"{symbol} added"}, status=status.HTTP_201_CREATED)

    def delete(self, request):
        symbol = request.data.get('symbol').upper()
        stock = get_object_or_404(Stock, symbol=symbol)

        watchlist, _ = Watchlist.objects.get_or_create(user=request.user)
        watchlist.stocks.remove(stock)
        return Response({"message": f"{symbol} removed"}, status=status.HTTP_204_NO_CONTENT)

class ChartDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, symbol):
        # We can accept an optional 'days' parameter from the URL, defaulting to 30 days
        days = int(request.query_params.get('days', 30))
        
        # Call our new service function
        data = get_historical_ohlc(symbol, days=days)
        
        if not data:
            return Response(
                {"error": "Data not found or invalid symbol."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        return Response(data, status=status.HTTP_200_OK)