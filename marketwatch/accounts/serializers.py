from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        # Ensure the password is never returned in API responses
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # create_user automatically hashes the password securely
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user