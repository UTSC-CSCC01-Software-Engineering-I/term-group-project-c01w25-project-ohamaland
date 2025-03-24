from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GetUserIdView,
    GroupDelete,
    GroupMembersLeave,
    ReceiptOverview,
    ReceiptDetail,
    ItemOverview,
    ItemDetail,
    GroupOverview,
    GroupDetail,
    GroupMembersOverview,
    GroupMembersDetail,
    SubscriptionList,
    SubscriptionDetail,
    register,
    login,
    logout,
    me,
    receipt_upload,
    InsightsView,
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
        "groups/<int:group_pk>/members/",
        GroupMembersOverview.as_view(),
        name="group-members-list",
    ),
    path(
        "groups/<int:group_pk>/members/<int:pk>/",
        GroupMembersDetail.as_view(),
        name="group-members-detail",
    ),

    path('groups/<int:pk>/delete/', GroupDelete.as_view(), name='group-delete'),
    path('groups/<int:group_id>/members/<int:user_id>/leave/', GroupMembersLeave.as_view(), name='group-leave'),
    path('user_id/', GetUserIdView.as_view(), name='get_user_id'),
    path("user/register/", register, name="user-register"),
    path("user/login/", login, name="user-login"),
    path("user/logout/", logout, name="user-logout"),
    path("user/me/", me, name="me"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("subscriptions/", SubscriptionList.as_view(), name="subscription-list"),
    path(
        "subscriptions/<int:pk>/",
        SubscriptionDetail.as_view(),
        name="subscription-detail",
    ),
    path(
        "analytics/insights/<str:period>/",
        InsightsView.as_view(),
        name="InsightsView",
    ),
    path("receipts/upload/", receipt_upload, name="image-upload"),
]
