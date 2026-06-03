from rest_framework import serializers
# Import our database models from the current directory's models.py file
from .models import Event, EventAttendee

class EventListSerializer(serializers.ModelSerializer):
    """
    EVENT LIST SERIALIZER
    
    Analogy:
    Think of a serializer like a translation layer or a custom filter.
    Our database holds complex Python objects, but the browser only understands simple text (JSON).
    This serializer acts as a translator, turning Event objects into clean, readable JSON cards.
    
    We also add custom computed fields that do not exist directly in the database table,
    like calculating the name of the organizer and counting the total number of attendees!
    """

    # A custom field that does not map directly to a database column.
    # Instead, we calculate its value dynamically using a method we write below.
    organizer_name = serializers.SerializerMethodField()

    # Another custom computed field to count the total signups for this event.
    attendee_count = serializers.SerializerMethodField()

    class Meta:
        # Link this serializer to the Event database model
        model = Event
        
        # Define the exact list of attributes we want to output to the frontend
        fields = [
            'id', 
            'title', 
            'location', 
            'date', 
            'banner_url', 
            'is_published', 
            'created_at',
            'organizer_name',
            'attendee_count'
        ]
        
        # We set all these fields to read-only since this serializer is strictly for
        # showing data, not for validating or saving new events.
        read_only_fields = fields

    def get_organizer_name(self, obj):
        """
        Gets the full name of the organizer, falling back to their email address.
        """
        # obj is the Event database row instance being translated.
        # We jump across the relationship link to inspect the organizer's user card.
        if obj.organizer.full_name:
            return obj.organizer.full_name
        return obj.organizer.email

    def get_attendee_count(self, obj):
        """
        Queries the database to count the number of attendees for this event.
        """
        # We query the related 'attendees' list for this event and count the records.
        # This is equivalent to running a count query on the database.
        return obj.attendees.count()


class EventDetailSerializer(EventListSerializer):
    """
    EVENT DETAIL SERIALIZER
    
    This serializer inherits everything from EventListSerializer (including the computed name
    and count fields) but adds the full description text. We use this for the single event page.
    """
    
    class Meta(EventListSerializer.Meta):
        # We extend the fields list to include the long event description
        fields = EventListSerializer.Meta.fields + ['description']
        read_only_fields = fields
