from rest_framework import generics
from rest_framework.response import Response

from .models import Receipt, Item
from .serializers import ReceiptSerializer, ItemSerializer

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
    queryset = Item.objects.all()

    # Assures GET request for all items is formatted properly
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"items": serializer.data})

# GET, PUT, PATCH & DELETE of Items
class ItemDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()