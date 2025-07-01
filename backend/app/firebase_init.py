import os
# import firebase_admin
# from firebase_admin import credentials, db
from .config import settings

# def initialize_firebase():
#     try:
#         # Try to get the default app
#         firebase_admin.get_app()
#     except ValueError:
#         # If no app exists, initialize one
#         cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT)
#         firebase_admin.initialize_app(cred, {
#             'databaseURL': settings.FIREBASE_DATABASE_URL
#         })
#         
#         # Initialize the database reference
#         db.reference('/')  # This will test the connection

# Initialize Firebase when this module is imported
# initialize_firebase() 