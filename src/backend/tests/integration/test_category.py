import pytest
from tests.integration.client import get_client
from models.menu import Category

# Tests
# Checks for manager role
# Add category
#   Catch invalid category with empty name
#   Catch doubled category
#   Permits legal category
# Update category
#   Catch updating nonexistent category
#   Catch updating existing category but with invalid data
#   Permits legal update
# Remove category
#   Catch removing nonexistent category
#   Catch removing existing category but with invalid data
#   Permits legal removal
