from django.db import models
from django.contrib.auth.models import User

class Watchlist(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    ticker = models.CharField(max_length=10) # e.g., 'AAPL', 'RELIANCE.NS'
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.ticker} - {self.owner.username}"