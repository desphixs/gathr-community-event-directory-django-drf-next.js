'use client';

// Import React hooks for client state and side-effects
import React, { useState, useEffect } from 'react';
// Import Next.js routing and image components for navigation and media rendering
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
// Import beautiful, clean icons from Lucide React
import { Loader2, ArrowLeft, Calendar, MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react';
// Import our custom server actions to fetch and manage event attendance
import { 
  getEventDetailAction, 
  getAttendanceStatusAction, 
  joinEventAction 
} from '@/app/actions/events/events';
// Import user profile actions to load header profile session credentials
import { getUserProfileAction } from '@/app/actions/userauths/profile';
// Import the HeaderClient navigation component
import HeaderClient from '@/components/HeaderClient';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Clean parsing of dynamic route ID to ensure standard numeric values
  const eventId = Number(params.id);

  // State Management Hooks:
  // - event: holds the retrieved database meetup information
  // - loading: controls when to display the pulsing skeleton layout
  // - error: captures API failures to show user warnings
  // - joined: tracks if the authenticated user is attending this meetup
  // - attendeeCount: tracks the total counter of attendees
  // - joinLoading: displays a spinner inside the RSVP button during api actions
  // - session: holds active user profile details passed to the HeaderClient
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [session, setSession] = useState<any>(null);

  // Mount logic: fetch the event details, RSVP status, and session details in parallel
  useEffect(() => {
    async function loadEventAndStatus() {
      if (isNaN(eventId)) {
        setError("Invalid event ID format.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // We perform these calls in parallel so the page loads as fast as possible
      const eventPromise = getEventDetailAction(eventId);
      const statusPromise = getAttendanceStatusAction(eventId).catch(() => {
        // Catch authentication block error gracefully if the visitor is logged out
        return { success: false, joined: false, attendeeCount: 0 };
      });
      const sessionPromise = getUserProfileAction().catch(() => null);

      try {
        const [eventRes, statusRes, sessionRes] = await Promise.all([
          eventPromise,
          statusPromise,
          sessionPromise
        ]);

        // 1. Process Event Details Response
        if (eventRes.success && eventRes.event) {
          setEvent(eventRes.event);
          // Set fallback attendee count from public details
          setAttendeeCount(eventRes.event.attendee_count || 0);
        } else {
          setError(eventRes.message || "Failed to load the event details.");
        }

        // 2. Process RSVP Status Response (Authenticated users only)
        if (statusRes && statusRes.success) {
          setJoined(statusRes.joined);
          setAttendeeCount(statusRes.attendeeCount);
        }

        // 3. Process Header Profile Credentials
        if (sessionRes && sessionRes.success && sessionRes.user) {
          setSession({
            authenticated: true,
            user: {
              name: sessionRes.user.full_name || 'Anonymous User',
              email: sessionRes.user.email,
              avatar: sessionRes.user.avatar || null
            }
          });
        }
      } catch (err: any) {
        setError("An unexpected connection error occurred.");
      } finally {
        setLoading(false);
      }
    }

    loadEventAndStatus();
  }, [eventId]);

  // Helper utility: formats ISO calendar strings into standard friendly dates
  const formatEventDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  // RSVP toggle click handler
  const handleToggleAttendance = async () => {
    setJoinLoading(true);

    try {
      // Execute the server action toggle API call
      const res = await joinEventAction(eventId);

      if (res.success) {
        setJoined(res.joined);
        setAttendeeCount(res.attendeeCount);
      } else {
        // If the action returned a failure, we let it flow.
        // The default central apiFetch automatically handles the redirect to /login
        // if a 401 Unauthorized status is received, so we don't need magic handlers here!
      }
    } catch (err) {
      console.error("Failed to toggle attendance:", err);
    } finally {
      setJoinLoading(false);
    }
  };

  // Rendering Loader Skeleton states
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <HeaderClient session={session} />
        
        {/* Full-width Pulsing skeleton banner */}
        <div className="w-full h-80 md:h-[400px] bg-zinc-200 dark:bg-zinc-900 animate-pulse relative" />
        
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Back button skeleton layout */}
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-900 rounded-lg animate-pulse mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left wide content skeleton block */}
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-900 rounded-xl w-3/4 animate-pulse" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-900 rounded-lg w-1/4 animate-pulse" />
              <div className="h-40 bg-zinc-200 dark:bg-zinc-900 rounded-2xl w-full animate-pulse" />
            </div>
            
            {/* Right sticky card skeleton block */}
            <div className="lg:col-span-1">
              <div className="h-56 bg-zinc-200 dark:bg-zinc-900 rounded-3xl animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendering Error notification card
  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <HeaderClient session={session} />
        
        <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">Event Not Found</h2>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {error || "We couldn't retrieve the details for this event. It may have been unpublished or deleted."}
            </p>
          </div>
          <Link 
            href="/events" 
            className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Standard Header layout */}
      <HeaderClient session={session} />

      {/* FULL-WIDTH BANNER IMAGE COVER */}
      <div className="relative w-full h-80 md:h-[450px] bg-zinc-100 dark:bg-zinc-950 overflow-hidden border-b border-zinc-200/50 dark:border-zinc-900">
        {event.banner_url ? (
          <Image 
            src={event.banner_url} 
            alt={event.title} 
            fill 
            className="object-cover" 
            priority
          />
        ) : (
          // Default fall-back visual gradient
          <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-white/20 animate-pulse" />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Return to lists navigation shortcut */}
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" />
          Back to Events
        </Link>

        {/* TWO-COLUMN GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* LEFT WIDER COLUMN: Main Event details header, metadata metrics, and description */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white md:text-5xl leading-tight">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                <span>Organized by</span>
                <span className="text-zinc-900 dark:text-white font-bold">{event.organizer_name || "Anonymous Organizer"}</span>
              </div>
            </div>

            {/* Event Specification details boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 animate-pulse">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">Date and Time</h3>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1 leading-snug">
                    {formatEventDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">City Location</h3>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1 leading-snug">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Description segment */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">About the Event</h2>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {/* RIGHT NARROWER COLUMN: Sticky card for counters and Join Actions */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-xl shadow-zinc-150/10 dark:shadow-none space-y-6">
              
              {/* Counter Display widget */}
              <div className="space-y-1 text-center lg:text-left">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">Event Attendance</span>
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                  <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    {attendeeCount}
                  </span>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    attending
                  </span>
                </div>
              </div>

              {/* Action trigger button: Toggles registration logs in the database */}
              <button 
                onClick={handleToggleAttendance}
                disabled={joinLoading}
                className={`w-full py-4 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  joined 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100/80 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 shadow-red-500/5 hover:shadow-red-500/10' 
                    : 'bg-violet-600 hover:bg-violet-750 text-white shadow-violet-500/10 hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:-translate-y-0'
                }`}
              >
                {joinLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking list...
                  </>
                ) : joined ? (
                  'Leave Event'
                ) : (
                  'Join Event'
                )}
              </button>

              {/* Confirmation tag hints */}
              {joined && (
                <div className="flex items-center gap-2 justify-center lg:justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>You're registered for this meetup!</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
