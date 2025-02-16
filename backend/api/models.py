from django.core.exceptions import ValidationError
from django.db import models

class Group(models.Model):
    creator = models.IntegerField()
    name = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "group"

    def __str__(self):
        return f"Group {self.name} - {self.creator}"

class GroupMembers(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user_id = models.IntegerField()
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_members'
        unique_together = ('group', 'user_id')

class Receipt(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('debit', 'Debit'),
        ('credit', 'Credit'),
        ('cash', 'Cash'),
    ]

    user_id = models.IntegerField(null=True, blank=True)
    group = models.ForeignKey(Group, null=True, blank=True, on_delete=models.CASCADE)
    merchant = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    date = models.DateField()
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    receipt_image_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "receipt"

    def clean(self):
        if self.user_id and self.group:
            raise ValidationError("A receipt can only be linked to either a user or a group.")
        if not self.user_id and not self.group:
            raise ValidationError("A receipt must be linked to either a user or a group.")

    def save(self, *args, **kwargs):
        # Clean the instance before saving to validate the constraints
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Receipt {self.id} - {self.merchant}"

class Item(models.Model):
    CATEGORY_CHOICES = [
        ('home', 'Home'),
        ('food', 'Food'),
        ('clothing', 'Clothing'),
        ('utilities', 'Utilities'),
        ('entertainment', 'Entertainment'),
        ('fixtures', 'Fixtures'),
        ('furniture', 'Furniture'),
        ('health', 'Health'),
        ('beauty', 'Beauty'),
        ('electronics', 'Electronics'),
    ]

    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name='items')
    name = models.TextField()
    category = models.TextField(blank=True, null=True, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

    class Meta:
        db_table = "item"

    def __str__(self):
        return f"Item {self.name} - {self.quantity}"
