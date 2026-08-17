from rest_framework import serializers
from .models import Watchlist

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'ticker', 'added_on']
        read_only_fields = ['owner']

    def create(self, validated_data):
        # Automatically assign the logged-in user as the owner
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)