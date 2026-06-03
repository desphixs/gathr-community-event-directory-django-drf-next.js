from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

# Import our database model and serialization schemas
from .models import Event
from .serializers import EventListSerializer, EventDetailSerializer

class EventListView(APIView):
    """
    PUBLIC EVENTS LIST API VIEW
    
    Analogy:
    Think of this view like a public notice board curator.
    Anyone can walk up to the board and ask for a list of all events.
    They can also specify a request like: "Only show me meetups in Lagos"
    or "Show me what is happening on a specific date".
    The curator filters the flyers on the fly and returns only the matching ones.
    """
    
    # AllowAny permissions means public visitors can access this listing without logging in
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Handles incoming HTTP GET requests to list and filter events.
        """
        # 1. Fetch all published events from the database.
        # select_related('organizer') pre-loads the user table records in a single join query.
        # prefetch_related('attendees') pre-loads the attendee join table records to avoid N+1 query loops.
        # order_by('date') sorts the list so events happening soonest appear first.
        events = Event.objects.filter(is_published=True).select_related('organizer').prefetch_related('attendees').order_by('date')

        # 2. Extract query filtering parameters from the request URL address.
        # E.g., if the URL is /api/events/?location=Lagos, then location will be "Lagos".
        location = request.query_params.get('location', None)
        date = request.query_params.get('date', None)

        # 3. If a location was requested, filter our list case-insensitively.
        # location__icontains performs a database "LIKE %location%" query that ignores uppercase/lowercase.
        if location:
            events = events.filter(location__icontains=location)

        # 4. If a date was requested, filter our list by that specific calendar date.
        # date__date strips the hour/minutes timestamp so we can compare calendar days directly.
        if date:
            events = events.filter(date__date=date)

        # 5. Pass our final filtered list of Event records to the serializer translator.
        # many=True is required because we are translating a list of rows, not just a single row.
        serializer = EventListSerializer(events, many=True)

        # 6. Return the finalized list of serialized events back to the client browser.
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventDetailView(APIView):
    """
    PUBLIC EVENT DETAIL API VIEW
    
    This view retrieves the complete, detailed profile of a single specific meetup.
    If the event is deleted or not published, it returns a friendly 404 message.
    """
    
    # Anyone is allowed to see the details of a meetup
    permission_classes = [AllowAny]

    def get(self, request, pk):
        """
        Handles incoming HTTP GET requests for a single event matching the database ID (pk).
        """
        try:
            # Try to grab the event from the database using its primary key (pk).
            # We also ensure the event is published so drafts cannot be previewed publicly.
            event = Event.objects.select_related('organizer').prefetch_related('attendees').get(pk=pk, is_published=True)
            
            # Serialize the single event object, including the description field
            serializer = EventDetailSerializer(event)
            
            # Return the translated data back to the client
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Event.DoesNotExist:
            # If the database searches for the ID and finds nothing, return a 404 error response
            return Response(
                {"message": "Event not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
