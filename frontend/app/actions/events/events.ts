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


