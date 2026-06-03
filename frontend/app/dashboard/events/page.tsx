'use client';

// Import React hooks for client state and component lifecycle management
import React, { useState, useEffect } from 'react';
// Import Next.js Link component for client-side navigation
import Link from 'next/link';
// Import Next.js router hook to programmatically navigate
import { useRouter } from 'next/navigation';
// Import Lucide React icons for a beautiful, modern UI
import { Loader2, Calendar, MapPin, Users, Plus, AlertCircle, ExternalLink, CalendarDays } from 'lucide-react';
// Import the DashboardWrapper component which renders the responsive sidebar layout
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import our server action to fetch events created by this specific organizer
import { getMyEventsAction } from '@/app/actions/events/events';

// Define the Event type to keep our TypeScript compiler happy and ensure clean type definitions
interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  banner_url: string;
  is_published: boolean;
  created_at: string;
  attendee_count?: number;
  organizer_name?: string;
}

/**
 * ORGANIZER DASHBOARD EVENTS PAGE
 * 
 * Analogy:
 * Think of this page like the control deck of a community center organizer.
 * When you walk in, the system retrieves only the notices you personally pinned on the wall.
 * You can see how many attendees signed up for each meetup, check the publishing status,
 * and click a quick button to pin a new notice (create an event).
 */
export default function OrganizerEventsPage() {
  const router = useRouter();

  // state hooks to manage events list, loaders, and API error states
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load events created by this organizer when the page mounts
  useEffect(() => {
    async function loadOrganizerEvents() {
      try {
        setLoading(true);
        setError(null);
        
        // Execute the server action to fetch private events
        const result = await getMyEventsAction();
        
        if (result.success) {
          setEvents(result.events);
        } else {
          setError(result.message || "Failed to load your events list.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected network error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadOrganizerEvents();
  }, []);

  return (
    <DashboardWrapper>
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section: Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              My Organized Events
            </h1>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
              Manage and track registrations for meetups you have created.
            </p>
          </div>
          
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto text-center"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                Failed to load events
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Loader State Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Retrieving your event portfolio...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto mt-8">
            <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center mb-6">
              <CalendarDays className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              No Events Created Yet
            </h2>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-2">
              You haven't published any meetups yet. Create your first event to start gathering community attendees!
            </p>
            <Link
              href="/dashboard/events/new"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              // Format date into a human-readable day string
              const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div 
                  key={event.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-xl shadow-zinc-100/10 dark:shadow-none hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Event banner visual display */}
                  <div className="relative h-44 w-full bg-zinc-100 dark:bg-zinc-950 shrink-0">
                    {event.banner_url ? (
                      <img 
                        src={event.banner_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback gradient cover if uploader was skipped
                      <div className="w-full h-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-violet-500/20" />
                      </div>
                    )}
                    
                    {/* Status badges overlays */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        event.is_published 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                      }`}>
                        {event.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Event Text Metadata details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1 mb-2 hover:text-violet-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    {/* Metadata lines with clean icons */}
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{event.attendee_count || 0} Registered Attendees</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer wrapper card */}
                  <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 shrink-0">
                    <Link
                      href={`/events/${event.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex-grow text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Public Event
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
