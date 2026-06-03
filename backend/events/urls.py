from django.urls import path
# Import our view handlers from the views.py file in the current directory
from .views import (
    EventListView, 
    EventDetailView, 
    EventCreateView, 
    CloudinaryEventSignatureView, 
    OrganizerEventListView,
    EventJoinToggleView,
    EventAttendanceStatusView,
    OrganizerEventDetailView,
    OrganizerStatsView
)

urlpatterns = [
    # Route for listing all events or searching/filtering them.
    # Handles GET requests at: /api/events/
    path('', EventListView.as_view(), name='event-list'),
    
    # Route for displaying the complete details of a single meetup.
    # Handles GET requests at: /api/events/<id>/ (e.g. /api/events/1/)
    # <int:pk> captures the ID from the URL and passes it as a keyword argument named 'pk' to the view.
    path('<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Route for toggling joining and leaving an event.
    # Handles POST requests at: /api/events/<id>/join/ (e.g. /api/events/1/join/)
    path('<int:pk>/join/', EventJoinToggleView.as_view(), name='event-join-toggle'),

    # Route for checking the attendance status of a user for a specific event.
    # Handles GET requests at: /api/events/<id>/status/ (e.g. /api/events/1/status/)
    path('<int:pk>/status/', EventAttendanceStatusView.as_view(), name='event-attendance-status'),

    # Route for creating a brand-new meetup.
    # Handles POST requests at: /api/events/create/
    path('create/', EventCreateView.as_view(), name='event-create'),

    # Route for generating a secure Cloudinary image upload signature.
    # Handles GET requests at: /api/events/cloudinary/signature/
    path('cloudinary/signature/', CloudinaryEventSignatureView.as_view(), name='event-cloudinary-signature'),

    # Route for listing all events created by the logged-in organizer.
    # Handles GET requests at: /api/events/my-events/
    path('my-events/', OrganizerEventListView.as_view(), name='organizer-events'),

    # Route for fetching dashboard statistics for the logged-in organizer.
    # Handles GET requests at: /api/events/my-stats/
    path('my-stats/', OrganizerStatsView.as_view(), name='organizer-stats'),

    # Route for fetching, updating, or deleting an existing event owned by the logged-in organizer.
    # Handles GET, PUT, and DELETE requests at: /api/events/<id>/update/ (e.g. /api/events/1/update/)
    path('<int:pk>/update/', OrganizerEventDetailView.as_view(), name='event-update'),
]




