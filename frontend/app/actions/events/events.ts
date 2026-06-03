'use server';

// Import our centralized apiFetch helper to make secure network calls to Django
import { apiFetch } from '@/lib/api';

/**
 * GET EVENTS LIST ACTION
 * 
 * Analogy:
 * Think of this action like a messenger boy sent from the frontend office to the backend archives.
 * The messenger holds query requests in his hand (location and date filters).
 * He constructs the correct hallway address (the URL query path), walks down to the backend,
 * retrieves the event cards, and returns them to the homepage catalog!
 */
export async function getEventsAction(filters?: { location?: string; date?: string }) {
    try {
        // Start building the query path to the django events endpoint
        let endpoint = '/events/';
        const queryParams: string[] = [];

        // If a location filter is provided by the search bar, append it as a query parameter
        if (filters?.location) {
            queryParams.push(`location=${encodeURIComponent(filters.location)}`);
        }

        // If a date filter is provided, append it as a query parameter
        if (filters?.date) {
            queryParams.push(`date=${encodeURIComponent(filters.date)}`);
        }

        // Join the query parameters with '&' and prepend with '?' if any exist
        if (queryParams.length > 0) {
            endpoint += `?${queryParams.join('&')}`;
        }

        // Send a GET request to the Django events list API using the central apiFetch utility
        const { ok, data } = await apiFetch(endpoint, {
            method: 'GET',
            cache: 'no-store', // Disable fetch caching to guarantee we retrieve the latest event updates
        });

        if (ok) {
            return {
                success: true,
                events: data,
            };
        } else {
            return {
                success: false,
                events: [],
                message: data.message || "Failed to retrieve events.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            events: [],
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * GET EVENT DETAIL ACTION
 * 
 * Analogy:
 * Think of this like a messenger fetching a single specific folder from the archives.
 * We hand the messenger the ID of the folder (the event ID), and he returns the full details.
 */
export async function getEventDetailAction(id: number) {
    try {
        // Send a GET request to retrieve a single event's details
        const { ok, data } = await apiFetch(`/events/${id}/`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                event: data,
            };
        } else {
            return {
                success: false,
                event: null,
                message: data.message || "Failed to retrieve event details.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            event: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * GET EVENT CLOUDINARY UPLOAD SIGNATURE
 * 
 * Analogy:
 * Think of this like asking the hotel desk clerk for a secure ticket/voucher.
 * We call Django's signature endpoint, and Django gives us back signature details
 * so the frontend can upload the banner image directly to Cloudinary.
 */
export async function getEventCloudinarySignatureAction() {
    try {
        const { ok, data } = await apiFetch('/events/cloudinary/signature/', {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                signatureData: data,
            };
        } else {
            return {
                success: false,
                signatureData: null,
                message: data.message || "Failed to retrieve upload signature.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            signatureData: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * CREATE EVENT ACTION
 * 
 * Analogy:
 * Think of this like submitting the final filled-out event flyer form to the community desk.
 * We pass the payload (including the title, description, location, date, and Cloudinary banner URL)
 * to save it permanently in the Django database.
 */
export async function createEventAction(payload: object) {
    try {
        const { ok, data } = await apiFetch('/events/create/', {
            method: 'POST',
            body: payload,
        });

        if (ok) {
            return {
                success: true,
                event: data,
            };
        } else {
            return {
                success: false,
                event: null,
                message: data.message || "Failed to create event. Please verify all fields.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            event: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * GET MY EVENTS LIST ACTION
 * 
 * Analogy:
 * Think of this like a messenger asking for folders in a private cabinet.
 * The messenger carries the user's login session cookies (via apiFetch) and requests
 * the private `/events/my-events/` list. Django validates their identity and returns
 * only the event cards created by this specific user.
 */
export async function getMyEventsAction() {
    try {
        const { ok, data } = await apiFetch('/events/my-events/', {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                events: data,
            };
        } else {
            return {
                success: false,
                events: [],
                message: data.message || "Failed to retrieve your events.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            events: [],
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}


/**
 * JOIN EVENT ACTION
 * 
 * Analogy:
 * Think of this server action like a clerk submitting an RSVP card to the registration office.
 * When the user clicks the RSVP button, this function dispatches a POST request to the toggle endpoint.
 * The backend either writes the user's name down (Join) or erases it (Leave) and returns the updated status.
 */
export async function joinEventAction(eventId: number) {
    try {
        // Send a POST request to the join toggle endpoint
        const { ok, data } = await apiFetch(`/events/${eventId}/join/`, {
            method: 'POST',
        });

        if (ok) {
            return {
                success: true,
                message: data.message,
                joined: data.joined,
                attendeeCount: data.attendee_count,
            };
        } else {
            return {
                success: false,
                message: data.message || "Failed to update attendance.",
                joined: false,
                attendeeCount: 0,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
            joined: false,
            attendeeCount: 0,
        };
    }
}

/**
 * GET ATTENDANCE STATUS ACTION
 * 
 * Analogy:
 * Think of this like asking the security desk to check the guest list.
 * We want to know: "Am I already registered for this event?" and "How many other people are going?"
 * The desk responds with a simple yes/no and the total attendee count.
 */
export async function getAttendanceStatusAction(eventId: number) {
    try {
        // Send a GET request to retrieve the user's attendance status and the attendee count
        // cache: 'no-store' ensures we always fetch the newest value instead of loading cached data
        const { ok, data } = await apiFetch(`/events/${eventId}/status/`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                joined: data.joined,
                attendeeCount: data.attendee_count,
            };
        } else {
            return {
                success: false,
                joined: false,
                attendeeCount: 0,
                message: data.message || "Failed to retrieve attendance status.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            joined: false,
            attendeeCount: 0,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}


/**
 * GET ORGANIZER EVENT DETAIL ACTION
 * 
 * Analogy:
 * Think of this like an organizer requesting to view their private event folder.
 * This checks that they own the event before displaying draft or sensitive data.
 */
export async function getOrganizerEventDetailAction(id: number) {
    try {
        // Send a GET request to the organizer update endpoint to fetch details
        const { ok, data } = await apiFetch(`/events/${id}/update/`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                event: data,
            };
        } else {
            return {
                success: false,
                event: null,
                message: data.detail || data.message || "Failed to retrieve organizer event details.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            event: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * UPDATE ORGANIZER EVENT ACTION
 * 
 * Analogy:
 * Think of this like submitting a request to modify a flyer.
 * We pass the updated fields to Django via a PUT request on the update endpoint.
 */
export async function updateOrganizerEventAction(id: number, payload: object) {
    try {
        // Send a PUT request with the updated details payload
        const { ok, data } = await apiFetch(`/events/${id}/update/`, {
            method: 'PUT',
            body: payload,
        });

        if (ok) {
            return {
                success: true,
                event: data,
            };
        } else {
            return {
                success: false,
                event: null,
                message: data.detail || data.message || "Failed to update event details.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            event: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * DELETE ORGANIZER EVENT ACTION
 * 
 * Analogy:
 * Think of this like request to permanently shred an event flyer.
 * We dispatch a DELETE request to our consolidated endpoint.
 */
export async function deleteOrganizerEventAction(id: number) {
    try {
        // Send a DELETE request to erase the event
        const { ok, data } = await apiFetch(`/events/${id}/update/`, {
            method: 'DELETE',
        });

        if (ok) {
            return {
                success: true,
                message: data.message || "Event deleted successfully.",
            };
        } else {
            return {
                success: false,
                message: data.detail || data.message || "Failed to delete event.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}

/**
 * GET ORGANIZER DASHBOARD STATS ACTION
 * 
 * Analogy:
 * Think of this like asking the accountant for a financial and attendance summary report.
 * We tell the accountant (Django) our name (token), and he calculates the total numbers of events,
 * attendee registrations, drafts, and pulls details of the most recent event created.
 */
export async function getOrganizerStatsAction() {
    try {
        // Send a GET request to the Django stats endpoint
        // cache: 'no-store' ensures we always fetch the newest statistics rather than a cached copy
        const { ok, data } = await apiFetch('/events/my-stats/', {
            method: 'GET',
            cache: 'no-store',
        });

        if (ok) {
            return {
                success: true,
                stats: {
                    totalEvents: data.total_events,
                    totalAttendees: data.total_attendees,
                    publishedEvents: data.published_events,
                    draftEvents: data.draft_events,
                    latestEvent: data.latest_event,
                },
            };
        } else {
            return {
                success: false,
                stats: null,
                message: data.detail || data.message || "Failed to retrieve dashboard statistics.",
            };
        }
    } catch (error: any) {
        return {
            success: false,
            stats: null,
            message: `Network error: ${error.message || 'Failed to connect to backend server.'}`,
        };
    }
}


