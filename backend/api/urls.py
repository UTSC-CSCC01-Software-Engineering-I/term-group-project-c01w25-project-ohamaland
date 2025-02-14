from django.urls import path
from .views import ReceiptList, ReceiptDetail, ItemList, ItemDetail, GroupList, GroupDetail

urlpatterns = [
    path('receipts/', ReceiptList.as_view(), name='receipt-list-create'),
    path('receipts/<int:pk>/', ReceiptDetail.as_view(), name='receipt-detail'),
    path('receipts/<int:receipt_id>/items/', ItemList.as_view(), name='item-list-create'),
    path('receipts/<int:receipt_id>/items/<int:pk>/', ItemDetail.as_view(), name='item-detail'),
    path('groups/', GroupList.as_view(), name='group-list-create'),
    path('groups/<int:pk>/', GroupDetail.as_view(), name='group-detail'),
]
