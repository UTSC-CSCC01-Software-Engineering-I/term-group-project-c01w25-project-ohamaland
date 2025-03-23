from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GetUserIdView,
    GroupDelete,
    GroupMembersLeave,
    ReceiptOverview,
    ReceiptDetail,
    ItemList,
    ItemDetail,
    GroupList,
    GroupDetail,
    GroupMembersList,
    GroupMembersDetail,
    UserRegisterView,
    UserLoginView,
    UserLogoutView,
    InsightsView
)

urlpatterns = [
    path("receipts/", ReceiptOverview.as_view(), name="receipt-list-create"),
    path("receipts/<int:pk>/", ReceiptDetail.as_view(), name="receipt-detail"),
    path(
        "receipts/<int:receipt_id>/items/", ItemList.as_view(), name="item-list-create"
    ),
    path(
        "receipts/<int:receipt_id>/items/<int:pk>/",
        ItemDetail.as_view(),
        name="item-detail",
    ),
    path("groups/", GroupList.as_view(), name="group-list-create"),
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
    path('groups/<int:pk>/delete/', GroupDelete.as_view(), name='group-delete'),
    path('groups/<int:group_id>/members/<int:user_id>/leave/', GroupMembersLeave.as_view(), name='group-leave'),
    path("user/register/", UserRegisterView.as_view()),
    path("user/login/", UserLoginView.as_view()),
    path("user/logout/", UserLogoutView.as_view()),
    path('user_id/', GetUserIdView.as_view(), name='get_user_id'),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    path("analytics/insights/<str:period>/", InsightsView.as_view(), name="insights"),
]
