from rest_framework import generics
from rest_framework.response import Response

from .models import Receipt, Item
from .serializers import ReceiptSerializer, ItemSerializer

# TODO: When Account and Authentication are implemented, GET request for items should only return items from the Account

# POST & GET of Receipts
class ReceiptList(generics.ListCreateAPIView):
    serializer_class = ReceiptSerializer
    queryset = Receipt.objects.all()

    # Assures GET request for all items is formatted properly
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"receipts": serializer.data})

# GET, PUT, PATCH & DELETE of Receipts
class ReceiptDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReceiptSerializer
    queryset = Receipt.objects.all()

# POST & GET of Items
class ItemList(generics.ListCreateAPIView):
    serializer_class = ItemSerializer

    def get_queryset(self):
        # Filter items by the receipt_id provided in the URL
        receipt_id = self.kwargs['receipt_id']
        return Item.objects.filter(receipt_id=receipt_id)

    # Assures GET request for items under a specific receipt
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"items": serializer.data})

    # Handle POST request to create a new item under a specific receipt
    def perform_create(self, serializer):
        receipt = Receipt.objects.get(id=self.kwargs['receipt_id']) # Checks if the receipt with ID exists
        serializer.save(receipt=receipt)

# GET, PUT, PATCH & DELETE of Items
class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    
    # Not 100% sure whether this works
    def get_object(self):
        return Item.objects.get(receipt=self.kwargs['receipt_id'], id=self.kwargs['pk'])