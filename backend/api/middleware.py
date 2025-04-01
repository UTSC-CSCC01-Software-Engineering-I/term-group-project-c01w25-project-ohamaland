from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from urllib.parse import parse_qs


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """

    async def __call__(self, scope, receive, send):
        # Close old database connections to prevent usage after connection timeout
        close_old_connections()

        token = parse_qs(scope["query_string"].decode()).get("token", [None])[0]
        scope["user"] = await self.get_user(token)
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        if token is None:
            return AnonymousUser()

        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except AuthenticationFailed:
            return AnonymousUser()


def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))
