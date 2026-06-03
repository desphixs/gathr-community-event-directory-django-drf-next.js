from django.db import models
from django.conf import settings

class Event(models.Model):
    """
    EVENT MODEL
    
    Analogy:
    Think of this model like a blank flyer template for a community gathering.
    It contains all the details needed for people to know where, when, and what the meetup is,
    plus who is organizing it!
    """

    # We link the event to the user who created it (the Organizer).
    # ForeignKey creates a one-to-many relationship (one user can organize many events).
    # settings.AUTH_USER_MODEL points to our custom User model in settings.py.
    # on_delete=models.CASCADE means if the organizer's account is deleted, their events are deleted too.
    # related_name='organized_events' lets us query all events created by a user using user.organized_events.all().
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )

    # The title/headline of the event. CharField is used for short text inputs.
    title = models.CharField(max_length=200)

    # The detailed explanation of what the event is about. TextField is used for long paragraphs.
    description = models.TextField()

    # The city, region, or physical venue location where people will gather.
    location = models.CharField(max_length=255)

    # The exact date and calendar time when the event will start.
    date = models.DateTimeField()

    # The web link/URL to the uploaded banner image hosted on Cloudinary.
    # blank=True allows this field to be empty (optional).
    # default='' sets an empty string as the default value if no URL is provided.
    banner_url = models.URLField(max_length=500, blank=True, default='')

    # A toggle switch to publish or hide the event. BooleanField stores True (Yes) or False (No).
    # For now, it defaults to True so newly created events are published immediately.
    is_published = models.BooleanField(default=True)

    # Records the exact timestamp when this event flyer was first created.
    # auto_now_add=True sets the date automatically only when the row is first created.
    created_at = models.DateTimeField(auto_now_add=True)

    # Records the exact timestamp of the last time this event flyer was edited.
    # auto_now=True updates this field automatically every time the event is saved.
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Returns a friendly text name representing the event when viewed in lists or admin panel.
        """
        return self.title


class EventAttendee(models.Model):
    """
    EVENT ATTENDEE MODEL
    
    Analogy:
    Think of this model like a physical sign-up sheet or ticket stub.
    Each ticket stub links one specific Guest (User) to one specific Event.
    If 50 different guests sign up for the same event, we will have 50 ticket stub records.
    """

    # Links this attendance ticket to the specific Event.
    # on_delete=models.CASCADE means if the event is deleted, all attendance records are also deleted.
    # related_name='attendees' lets us find all attendees of an event using event.attendees.all().
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='attendees'
    )

    # Links this attendance ticket to the specific User who signed up.
    # on_delete=models.CASCADE means if the user deletes their account, their ticket is deleted.
    # related_name='event_registrations' lets us find all events a user joined using user.event_registrations.all().
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_registrations'
    )

    # Records the exact date and time when the user clicked 'Join Event'.
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together acts like a safety guardrail.
        # It guarantees that a specific user can only sign up for a specific event exactly once.
        # They cannot buy multiple tickets to the exact same meetup!
        unique_together = ('event', 'user')

    def __str__(self):
        """
        Returns a description showing who is attending which event.
        """
        return f"{self.user} attending {self.event}"
