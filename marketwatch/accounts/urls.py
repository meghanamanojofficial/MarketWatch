from django.urls import path
from .views import RegisterView, UserDashboardView, WatchlistActionView, ChartDataView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', UserDashboardView.as_view(), name='dashboard'),
    path('watchlist-action/', WatchlistActionView.as_view(), name='watchlist-action'),
    path('chart-data/<str:symbol>/', ChartDataView.as_view(), name='chart-data'),
]