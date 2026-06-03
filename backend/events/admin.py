from django.contrib import admin
# Import our models so we can register them on the admin board
from .models import Event, EventAttendee

class EventAdmin(admin.ModelAdmin):
    """
    CUSTOM EVENT ADMIN INTERFACE
    
    Analogy:
    Think of this class like designing a custom control dashboard for a library curator.
    Instead of seeing a plain list of items, we decide exactly which columns are displayed,
    what sidebar filters are available, and which columns are searchable.
    """
    
    # The columns/fields to show in the list view of the admin panel table.
    list_display = ['title', 'organizer', 'location', 'date', 'is_published', 'created_at']
    
    # Adds a sidebar filter box on the right of the page to filter events quickly.
    list_filter = ['is_published', 'location', 'date']
    
    # Adds a search bar at the top of the list view. Django will scan these text fields
    # whenever the administrator types a query into the search box.
    search_fields = ['title', 'description', 'location']


class EventAttendeeAdmin(admin.ModelAdmin):
    """
    CUSTOM EVENT ATTENDEE ADMIN INTERFACE
    
    This class configures how we manage guest attendance slips inside the admin console.
    """
    
    # The fields to show in the guest list view table.
    list_display = ['event', 'user', 'joined_at']
    
    # Adds a filter box allowing us to inspect guests attending a specific event.
    list_filter = ['event']


# Finally, register our models and their custom dashboard configs on the admin site
admin.site.register(Event, EventAdmin)
admin.site.register(EventAttendee, EventAttendeeAdmin)
