from django.urls import path
from .views import ReceiptList, ReceiptDetail, ItemList, ItemDetail

urlpatterns = [
    path('receipts/', ReceiptList.as_view(), name='receipt-list-create'),
    path('receipts/<int:pk>/', ReceiptDetail.as_view(), name='receipt-detail'),
    path('receipts/<int:receipt_id>/items/', ItemList.as_view(), name='item-list-create'),
    path('receipts/<int:receipt_id>/items/<int:pk>/', ItemDetail.as_view(), name='item-detail'),
]
