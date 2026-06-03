from django.urls import path
# Import our view handlers from the views.py file in the current directory
from .views import EventListView, EventDetailView

urlpatterns = [
    # Route for listing all events or searching/filtering them.
    # Handles GET requests at: /api/events/
    path('', EventListView.as_view(), name='event-list'),
    
    # Route for displaying the complete details of a single meetup.
    # Handles GET requests at: /api/events/<id>/ (e.g. /api/events/1/)
    # <int:pk> captures the ID from the URL and passes it as a keyword argument named 'pk' to the view.
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),
]
