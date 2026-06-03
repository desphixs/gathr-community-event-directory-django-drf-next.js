'use client';

// Import React hooks for client state and component lifecycle management
import React, { useState, useEffect } from 'react';
// Import Next.js Link component for client-side navigation
import Link from 'next/link';
// Import Lucide React icons for a beautiful, modern UI design
import { 
  Loader2, Calendar, Users, Globe, FileText, 
  Plus, AlertCircle, ArrowRight, ExternalLink, Pencil 
} from 'lucide-react';
// Import the DashboardWrapper component which renders the sidebar layout
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import our dashboard stats server action
import { getOrganizerStatsAction } from '@/app/actions/events/events';

// Define the interface for the statistics data
interface StatsData {
  totalEvents: number;
  totalAttendees: number;
  publishedEvents: number;
  draftEvents: number;
  latestEvent: {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    banner_url: string;
    is_published: boolean;
    attendee_count?: number;
  } | null;
}

/**
 * ORGANIZER DASHBOARD OVERVIEW PAGE
 * 
 * Analogy:
 * Think of this dashboard like the dashboard of an event organizer's office.
 * When you walk in, the receptionist gives you a summary card showing:
 * - How many events you have hosted so far (Total Events)
 * - How many total guests have signed up (Total Attendees)
 * - How many are currently active/live (Published) vs. in progress (Drafts)
 * - A preview of the flyer you just pinned on the wall (Latest Event)
 */
export default function DashboardOverviewPage() {
  // state hooks to hold our stats data, loaders, and network error variables
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the dashboard stats from Django when this page loads
  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoading(true);
        setError(null);

        // Call the server action that hits the backend stats endpoint
        const result = await getOrganizerStatsAction();

        if (result.success && result.stats) {
          setStats(result.stats);
        } else {
          setError(result.message || 'Failed to load dashboard metrics.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected network error occurred.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  // Helper function to format the ISO date string into a friendly, human-readable format
  const formatEventDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <DashboardWrapper>
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Header Section: Title, Greeting and Create Event CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-sm font-semibold text-zinc-505 dark:text-zinc-400 mt-1">
              Analyze your event portfolio, attendee registrations, and latest updates at a glance.
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

        {/* Error Alert Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Failed to load statistics</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner Page Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-violet-650 animate-spin mb-4" />
            <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400">Loading your metrics overview...</p>
          </div>
        ) : !stats ? (
          // Fallback if loading failed and stats are null
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500">No dashboard information available.</p>
          </div>
        ) : (
          <>
            {/* Stats Numeric Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Card 1: Total Events */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Total Events
                  </span>
                  <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <Calendar size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{stats.totalEvents}</h2>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Events created by you</p>
                </div>
              </div>

              {/* Card 2: Total Attendees */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Total Attendees
                  </span>
                  <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <Users size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{stats.totalAttendees}</h2>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Registrations across meetups</p>
                </div>
              </div>

              {/* Card 3: Published Events */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Published Events
                  </span>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                    <Globe size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{stats.publishedEvents}</h2>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Live and visible to everyone</p>
                </div>
              </div>

              {/* Card 4: Draft Events */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Draft Events
                  </span>
                  <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450">
                    <FileText size={18} />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{stats.draftEvents}</h2>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">Hidden from public listing</p>
                </div>
              </div>

            </div>

            {/* Content Display: Latest Event & Quick Navigation Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Latest Event Card Section */}
              <div className="lg:col-span-2 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Latest Created Event</h3>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">Quickly view or modify the details of your most recent meetup card.</p>
                </div>

                {stats.latestEvent ? (
                  <div className="border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 p-4">
                    {/* Visual banner photo */}
                    <div className="w-full md:w-44 h-28 bg-zinc-150 dark:bg-zinc-900 rounded-xl overflow-hidden shrink-0">
                      {stats.latestEvent.banner_url ? (
                        <img 
                          src={stats.latestEvent.banner_url} 
                          alt={stats.latestEvent.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-violet-500/20" />
                        </div>
                      )}
                    </div>

                    {/* Metadata text lines */}
                    <div className="flex-grow flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${stats.latestEvent.is_published ? 'bg-emerald-550/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/25' : 'bg-zinc-200/50 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300/45 dark:border-zinc-700'}`}>
                            {stats.latestEvent.is_published ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550">
                            {stats.latestEvent.attendee_count || 0} RSVPs
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-zinc-900 dark:text-white line-clamp-1">
                          {stats.latestEvent.title}
                        </h4>
                        <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
                          {formatEventDate(stats.latestEvent.date)}
                        </p>
                      </div>

                      {/* Detail action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <Link 
                          href={`/dashboard/events/${stats.latestEvent.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-250 dark:border-zinc-750 text-violet-650 dark:text-violet-400 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Details
                        </Link>
                        <Link 
                          href={`/events/${stats.latestEvent.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Page
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Latest event empty state placeholder card
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center bg-zinc-50/20 py-10">
                    <Calendar className="w-10 h-10 text-zinc-350 dark:text-zinc-650 mb-3" />
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No Event Found</h4>
                    <p className="text-xs font-semibold text-zinc-500 mt-1 max-w-xs">You haven't created any event listings yet. Create a meetup flyer to see it listed here.</p>
                  </div>
                )}
              </div>

              {/* Navigation panel */}
              <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Quick Actions</h3>
                  <p className="text-xs font-semibold text-zinc-500 mt-0.5">Control panel shortcuts.</p>
                </div>

                <div className="space-y-3">
                  {/* Shortcut: Go to event catalog page */}
                  <Link 
                    href="/dashboard/events" 
                    className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Manage Portfolio</h4>
                      <p className="text-[11px] text-zinc-500">Edit, publish, and delete events</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-850 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>

                  {/* Shortcut: Create new event */}
                  <Link 
                    href="/dashboard/events/new" 
                    className="group flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100/80 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Create New Event</h4>
                      <p className="text-[11px] text-zinc-500">Post a new meetup flyer</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-850 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </DashboardWrapper>
  );
}
