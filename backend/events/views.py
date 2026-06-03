import time
import hashlib
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

# Import our database model and serialization schemas
from .models import Event, EventAttendee
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


class OrganizerEventListView(APIView):
    """
    ORGANIZER EVENT LIST API VIEW
    
    Analogy:
    Think of this like a private folder in a filing cabinet.
    Only the logged-in organizer has the key to this folder (IsAuthenticated).
    When they open it, they only see the events they created, sorted by when they were added.
    """
    # Only authenticated users can see their private event list
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handles incoming HTTP GET requests to list all events created by the logged-in user.
        """
        # Fetch only the events created by the current request user
        # prefetch_related('attendees') pre-loads the attendees list so we don't hit the database repeatedly when counting
        # order_by('-created_at') ensures the most recently created events appear at the top
        events = Event.objects.filter(organizer=request.user).prefetch_related('attendees').order_by('-created_at')
        
        # Translate the database events queryset into a list of JSON-serializable dictionaries
        serializer = EventListSerializer(events, many=True)
        
        # Return the serialized events list with a 200 OK status code
        return Response(serializer.data, status=status.HTTP_200_OK)


class EventJoinToggleView(APIView):
    """
    EVENT JOIN TOGGLE API VIEW
    
    Analogy:
    Think of this like a membership RSVP sheet.
    If your name is not on the list, we write it down.
    If your name is already on the list, we cross it off.
    """
    # Only authenticated users are allowed to RSVP to events
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Handles incoming HTTP POST requests to toggle event attendance.
        """
        # Step 1: Fetch the event from the database. It must be published.
        # If it doesn't exist or is not published, raise a 404 Not Found error.
        event = get_object_or_404(Event, pk=pk, is_published=True)

        # Step 2: Try to get the existing attendance record, or create a new one.
        # attendee is the retrieved or created record.
        # created is True if a new record was made, and False if it already existed.
        attendee, created = EventAttendee.objects.get_or_create(
            event=event, 
            user=request.user
        )

        # Step 3: If created is False, the user is already attending, so they want to leave.
        # We delete the registration record.
        if not created:
            attendee.delete()
            # Return response indicating the user left, with the new attendee count
            return Response(
                {
                    "message": "You have left this event.",
                    "joined": False,
                    "attendee_count": event.attendees.count()
                },
                status=status.HTTP_200_OK
            )

        # Step 4: If created is True, the user has newly joined the event.
        # Return response confirming the join, with the new attendee count.
        return Response(
            {
                "message": "You have joined this event!",
                "joined": True,
                "attendee_count": event.attendees.count()
            },
            status=status.HTTP_200_OK
        )


class EventAttendanceStatusView(APIView):
    """
    EVENT ATTENDANCE STATUS API VIEW
    
    Analogy:
    Think of this like looking at the guest list before deciding to attend.
    You check if your name is listed, and see how many others are going.
    """
    # Only authenticated users can check their RSVP status
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Handles incoming HTTP GET requests to check attendance status and count.
        """
        # Step 1: Check if this user is already registered for this event
        is_joined = EventAttendee.objects.filter(
            event_id=pk, 
            user=request.user
        ).exists()

        # Step 2: Count the total number of users signed up for this event
        attendee_count = Event.objects.get(pk=pk).attendees.count()

        # Step 3: Return the results to the client
        return Response(
            {
                "joined": is_joined,
                "attendee_count": attendee_count
            },
            status=status.HTTP_200_OK
        )


class OrganizerEventDetailView(APIView):
    """
    ORGANIZER EVENT DETAIL, UPDATE, AND DELETE API VIEW
    
    Analogy:
    Think of this like an event organizer returning to the community center to manage their flyer.
    The clerk checks their ID card (IsAuthenticated) to make sure they are the actual owner.
    - If the owner wants to inspect the details, the clerk shows them the full flyer (GET).
    - If the owner wants to change the details, they write the updated info on the form (PUT),
      the clerk validates it, updates the flyer on the board, and saves it.
    - If the owner wants to completely remove the flyer, the clerk takes it down and shreds it (DELETE).
    """
    # Only authenticated users can manage their own events
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Handles HTTP GET requests to fetch the current event details for editing.
        Only the organizer who created the event can access this.
        """
        # Step 1: Fetch the event from the database using its primary key (pk).
        event = get_object_or_404(Event, pk=pk)

        # Step 2: Verify that the requesting user is the organizer of the event.
        # If not, return a 403 Forbidden status code.
        if event.organizer != request.user:
            return Response(
                {"detail": "You do not have permission to view this event."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Step 3: Serialize the event details using EventDetailSerializer to send to the editor form.
        serializer = EventDetailSerializer(event)

        # Step 4: Return the serialized data with a 200 OK response.
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """
        Handles HTTP PUT requests to completely update the event flyer details.
        Only the organizer who created the event can save updates.
        """
        # Step 1: Fetch the event from the database using its primary key (pk).
        event = get_object_or_404(Event, pk=pk)

        # Step 2: Verify that the requesting user is the organizer of the event.
        # If not, return a 403 Forbidden status code.
        if event.organizer != request.user:
            return Response(
                {"detail": "You do not have permission to update this event."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Step 3: Pass the incoming request payload data to EventCreateSerializer for verification.
        # We specify partial=True so that if the organizer only edits a few fields, the other fields remain valid.
        serializer = EventCreateSerializer(data=request.data, partial=True)

        # Step 4: Run validation checks on the serializer inputs.
        # If validation fails, it automatically returns a 400 Bad Request error response.
        serializer.is_valid(raise_exception=True)

        # Step 5: Update the event fields one-by-one manually in our view code,
        # using the validated data if provided, or keeping the existing values as fallbacks.
        # This keeps the database write side-effects transparent and explicit for students.
        # If a field is present in the validated data, we update it; otherwise, we keep the original.
        event.title = serializer.validated_data.get('title', event.title)
        event.description = serializer.validated_data.get('description', event.description)
        event.location = serializer.validated_data.get('location', event.location)
        event.date = serializer.validated_data.get('date', event.date)
        event.banner_url = serializer.validated_data.get('banner_url', event.banner_url)
        event.is_published = serializer.validated_data.get('is_published', event.is_published)

        # Step 6: Save the modified event object back to the database.
        event.save()

        # Step 7: Serialize the updated event object to send it back to the client.
        serializer_out = EventDetailSerializer(event)

        # Step 8: Return the updated serialized data with a 200 OK status code.
        return Response(serializer_out.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        """
        Handles HTTP DELETE requests to remove an event from the database.
        Only the organizer who created the event can delete it.
        """
        # Step 1: Fetch the event from the database using its primary key (pk).
        event = get_object_or_404(Event, pk=pk)

        # Step 2: Verify that the requesting user is the organizer of the event.
        # If not, return a 403 Forbidden status code.
        if event.organizer != request.user:
            return Response(
                {"detail": "You do not have permission to delete this event."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Step 3: Delete the event record from the database.
        event.delete()

        # Step 4: Return a confirmation response with a 204 No Content status code.
        return Response(
            {"message": "Event deleted successfully."}, 
            status=status.HTTP_204_NO_CONTENT
        )


class OrganizerStatsView(APIView):
    """
    ORGANIZER STATS API VIEW
    
    Analogy:
    Think of this like a report card or scoreboard dashboard.
    An event organizer wants to see a summary of their achievements, like:
    - How many total flyers (events) they have put up.
    - How many total guests (attendees) have signed up across all flyers.
    - How many flyers are currently visible/published vs how many are drafts.
    - A snapshot of their latest created flyer.
    We retrieve these stats from different drawer compartments in the database and present them as a single clean report card.
    """
    # Only logged-in and authenticated organizers can request their dashboard stats
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Handles incoming HTTP GET requests to fetch organizer stats.
        """
        # Step 1: Count the total number of events created by this organizer.
        # Event.objects.filter(organizer=request.user) filters events by the logged-in user.
        # .count() calculates the total rows in the database matching this query.
        total_events = Event.objects.filter(organizer=request.user).count()

        # Step 2: Count the total number of attendee registrations across all events owned by this organizer.
        # We query the EventAttendee table and filter by attendees whose event's organizer is the logged-in user.
        # event__organizer matches the organizer foreign key relation on the Event model.
        total_attendees = EventAttendee.objects.filter(event__organizer=request.user).count()

        # Step 3: Count the number of published events (events that are live and visible to the public).
        published_events = Event.objects.filter(organizer=request.user, is_published=True).count()

        # Step 4: Count the number of draft events (events that are created but hidden from the public).
        draft_events = Event.objects.filter(organizer=request.user, is_published=False).count()

        # Step 5: Retrieve the single most recently created event by this organizer.
        # We filter by the organizer, sort by created_at in descending order (newest first) using '-created_at',
        # and grab the first item from the list using .first().
        latest_event_obj = Event.objects.filter(organizer=request.user).order_by('-created_at').first()

        # Step 6: If the organizer has created at least one event, serialize it.
        # Otherwise, set the latest event field to None.
        if latest_event_obj:
            # We use EventListSerializer to translate the event object to a JSON dictionary.
            latest_event = EventListSerializer(latest_event_obj).data
        else:
            latest_event = None

        # Step 7: Pack all these stats into a response dictionary and send it to the client.
        return Response(
            {
                "total_events": total_events,
                "total_attendees": total_attendees,
                "published_events": published_events,
                "draft_events": draft_events,
                "latest_event": latest_event
            },
            status=status.HTTP_200_OK
        )




