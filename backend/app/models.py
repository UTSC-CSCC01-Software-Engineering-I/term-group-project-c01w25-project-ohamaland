from mongoengine import Document, StringField, IntField

class User(Document):
    username = StringField(required=True, unique=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=True, unique=True)
