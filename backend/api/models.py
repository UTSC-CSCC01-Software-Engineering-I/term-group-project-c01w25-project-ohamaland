from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from django.utils.timezone import now


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


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=False)
    phone_number = PhoneNumberField(null=True, blank=True)

    class Meta:
        db_table = "user"

    def __str__(self):
        return self.username
    
    
class Receipt(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('Debit', 'Debit Card'),
        ('Credit', 'Credit Card'),
        ('Cash', 'Cash'),
    ]

    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="receipts")
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
        ('Home', 'Home'),
        ('Food', 'Food'),
        ('Clothing', 'Clothing'),
        ('Utilities', 'Utilities'),
        ('Entertainment', 'Entertainment'),
        ('Fixtures', 'Fixtures'),
        ('Furniture', 'Furniture'),
        ('Health', 'Health'),
        ('Beauty', 'Beauty'),
        ('Electronics', 'Electronics'),
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
    
    
class SpendingAnalytics(models.Model):
    TIME_CHOICES = [
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
        ('Quarterly', 'Quarterly'),
        ('Yearly', 'Yearly')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category_spending =models.JSONField(default=dict)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.TextField(max_length=20, choices = TIME_CHOICES)
    date = models.DateField(default=now)

    class Meta:
        db_table = "spending_analytics"
        unique_together = ('user', 'period', 'date')

    def __str__(self):
        return f"{self.user.username} - {self.period} - {self.date} - Total Spent: {self.total_spent}"