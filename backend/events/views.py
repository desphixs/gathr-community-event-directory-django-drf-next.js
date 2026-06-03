import time
import hashlib
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

# Import our database model and serialization schemas
from .models import Event
from .serializers import EventListSerializer, EventDetailSerializer, EventCreateSerializer

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


class EventCreateView(APIView):
    """
    CREATE EVENT VIEW
    
    Analogy:
    Think of this like an office at a community center where you go to submit a flyer.
    The clerk checks your ID card to make sure you are logged in (IsAuthenticated).
    Then they check the flyer details using the EventCreateSerializer form to make sure
    nothing is missing or incorrect. If everything looks good, they stamp the organizer's
    name on it and post it on the community wall (saving to the database).
    Finally, they give you a clean copy of the posted flyer as confirmation.
    """
    # Only logged-in users are allowed to create events
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Handles incoming HTTP POST requests to create a new event flyer.
        """
        # Step 1: Pass the incoming request form data to our EventCreateSerializer validator
        serializer = EventCreateSerializer(data=request.data)
        
        # Step 2: Validate the incoming fields. If anything is wrong, raise_exception=True
        # automatically returns a 400 Bad Request error response detailing the incorrect fields.
        serializer.is_valid(raise_exception=True)
        
        # Step 3: Explicitly create the event row in the database.
        # We assign the current request user as the organizer and fill in the rest of the validated form fields.
        event = Event.objects.create(
            organizer=request.user, 
            **serializer.validated_data
        )
        
        # Step 4: Serialize the newly created Event record using our detailed view layout
        serializer_out = EventDetailSerializer(event)
        
        # Return the serialized data representing the created event with a 201 Created status code.
        return Response(serializer_out.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        """
        Handles incoming HTTP GET requests for this view (mainly to keep it browsable in the browser).
        """
        # Return a simple guide message instructing users to send a POST request instead.
        return Response(
            {"message": "Send a POST request to create an event."}, 
            status=status.HTTP_200_OK
        )


class CloudinaryEventSignatureView(APIView):
    """
    CLOUDINARY EVENT SIGNATURE VIEW
    
    Analogy:
    Think of this view like a security booth that issues temporary cryptographically-sealed visitor passes.
    Before uploading a large flyer banner directly to Cloudinary (our remote media storage),
    the user asks us for a digital permit signature.
    We create a timestamp, specify the exact folder path, sign the parameters using our secret key,
    and return it. The user's browser takes this digital permit and uploads the image directly to Cloudinary,
    so our main backend server doesn't get slowed down by handling heavy binary image files!
    """
    # Only authenticated users are allowed to generate media upload permits
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Generates a secure cryptographic signature allowing direct upload to Cloudinary.
        """
        # Grab the current Unix time as a numeric timestamp integer
        timestamp = int(time.time())
        
        # Specify the target Cloudinary folder name for event banners
        folder_name = 'gathr_banners'
        
        # Construct the key-value signature payload parameter string
        params_to_sign = f"folder={folder_name}&timestamp={timestamp}"
        
        # Hash the parameter string and our secret key together using SHA-1
        # and represent the result as a hexadecimal string signature permit.
        signature = hashlib.sha1(
            f"{params_to_sign}{settings.CLOUDINARY_API_SECRET}".encode()
        ).hexdigest()
        
        # Return the Cloudinary parameters needed by the frontend client
        return Response({
            'signature': signature,
            'timestamp': timestamp,
            'api_key': settings.CLOUDINARY_API_KEY,
            'cloud_name': settings.CLOUDINARY_CLOUD_NAME,
            'folder': folder_name
        }, status=status.HTTP_200_OK)
