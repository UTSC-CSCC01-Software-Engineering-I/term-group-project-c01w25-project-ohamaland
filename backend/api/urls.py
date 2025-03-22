from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ReceiptOverview,
    ReceiptDetail,
    ItemOverview,
    ItemDetail,
    GroupOverview,
    GroupDetail,
    GroupMembersList,
    GroupMembersDetail,
    register,
    login,
    logout,
    me,
    SpendingAnalyticsView,
)

urlpatterns = [
    path("receipts/", ReceiptOverview.as_view(), name="receipt-list-create"),
    path("receipts/<int:pk>/", ReceiptDetail.as_view(), name="receipt-detail"),
    path(
        "receipts/<int:receipt_pk>/items/", ItemOverview.as_view(), name="item-list-create"
    ),
    path(
        "receipts/<int:receipt_pk>/items/<int:pk>/",
        ItemDetail.as_view(),
        name="item-detail",
    ),
    path("groups/", GroupOverview.as_view(), name="group-list-create"),
    path("groups/<int:pk>/", GroupDetail.as_view(), name="group-detail"),
    path(
        "groups/<int:group_id>/members/",
        GroupMembersList.as_view(),
        name="group-members-list",
    ),
    path(
        "groups/<int:group_id>/members/<int:pk>/",
        GroupMembersDetail.as_view(),
        name="group-members-detail",
    ),
    path("user/register/", register, name="user-register"),
    path("user/login/", login, name="user-login"),
    path("user/logout/", logout, name="user-logout"),
    path("user/me/", me, name="me"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path(
        "analytics/spending/<int:user_id>/<str:period>/",
        SpendingAnalyticsView.as_view(),
        name="spending-analytics",
    ),
]
