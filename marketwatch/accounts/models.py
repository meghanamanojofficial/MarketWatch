from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.symbol

class Watchlist(models.Model):
    # OneToOneField ensures each user only has exactly one primary watchlist
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account_watchlist')
    # ManyToManyField allows one user to track many stocks, and one stock to be tracked by many users
    stocks = models.ManyToManyField(Stock, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Watchlist"