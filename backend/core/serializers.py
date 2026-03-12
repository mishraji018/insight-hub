from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # FIX 1: username → email
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = (
            f"{user.first_name} {user.last_name}".strip() or user.email
        )
        # FIX 2: is_approved + is_staff add kiye
        token['is_approved'] = user.is_approved
        token['is_staff'] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # FIX 1: username → email
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['full_name'] = (
            f"{self.user.first_name} {self.user.last_name}".strip() or self.user.email
        )
        # FIX 3: is_approved + is_staff response mein bhi
        data['is_approved'] = self.user.is_approved
        data['is_staff'] = self.user.is_staff

        return data