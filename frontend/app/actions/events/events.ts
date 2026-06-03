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
