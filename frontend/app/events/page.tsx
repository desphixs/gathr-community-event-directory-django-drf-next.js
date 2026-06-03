'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, Search, RotateCcw, ArrowRight } from 'lucide-react';
import { getEventsAction } from '@/app/actions/events/events';
import HeaderClient from '@/components/HeaderClient';
import { getUserProfileAction } from '@/app/actions/userauths/profile';

/**
 * PUBLIC EVENTS LISTING PAGE
 * 
 * Analogy:
 * Think of this page like a community board in a local library.
 * Visitors can browse all upcoming gatherings, use search options to filter by city or date,
 * and view summaries of each event before deciding to join.
 */
export default function EventsListingPage() {
    // 1. Core State Management
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [session, setSession] = useState<any>(null);

    // 2. Fetch Events Wrapper
    const fetchEvents = async (filters?: { location?: string; date?: string }) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await getEventsAction(filters);
            if (res.success) {
                setEvents(res.events);
            } else {
                setErrorMsg(res.message || "Failed to load events.");
            }
        } catch (err: any) {
            setErrorMsg("A network error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Load events and session automatically on component mount
    useEffect(() => {
        fetchEvents();

        const loadSession = async () => {
            try {
                const res = await getUserProfileAction();
                if (res.success && res.user) {
                    setSession({
                        authenticated: true,
                        user: {
                            name: res.user.full_name || 'Anonymous User',
                            email: res.user.email,
                            avatar: res.user.avatar || null
                        }
                    });
                }
            } catch (err) {
                // Ignore session loading errors for anonymous visitors
            }
        };
        loadSession();
    }, []);

    // 4. Handle Filter Submission
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEvents({ location: locationFilter, date: dateFilter });
    };

    // 5. Clear All Filters
    const handleClearFilters = () => {
        setLocationFilter('');
        setDateFilter('');
        fetchEvents();
    };

    // Helper: Nicely format ISO dates into human-readable text
    const formatEventDate = (dateString: string) => {
        try {
            const dateObj = new Date(dateString);
            return dateObj.toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <HeaderClient session={session} />
            {/* HERO INTRODUCTION */}
            <div className="bg-gradient-to-br from-violet-600/10 via-transparent to-transparent dark:from-violet-950/20 py-16 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-6 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">Discover Community Meetups</h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">Explore local developer gatherings, designer critique sessions, and social events happening near you.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* SEARCH & FILTER BAR */}
                <form onSubmit={handleFilterSubmit} className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-150/20 dark:shadow-none mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Location input fields */}
                    <div className="relative w-full md:flex-1">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
                        <input type="text" placeholder="Search by city or country (e.g., Lagos)" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                    </div>

                    {/* Date picker inputs */}
                    <div className="relative w-full md:w-64">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                    </div>

                    {/* Filter buttons bundle */}
                    <div className="flex w-full md:w-auto gap-3">
                        <button type="submit" className="flex-1 md:flex-none px-6 py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-sm font-semibold shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer">
                            <Search className="w-4 h-4" />
                            Filter
                        </button>

                        {(locationFilter || dateFilter) && (
                            <button type="button" onClick={handleClearFilters} className="px-4 py-3.5 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <RotateCcw className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* SKELETON LOADER GRID */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/50 p-5 space-y-5 animate-pulse">
                                <div className="h-48 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl w-full" />
                                <div className="space-y-3">
                                    <div className="h-6 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg w-3/4" />
                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg w-1/2" />
                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg w-5/6" />
                                </div>
                                <div className="h-12 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl w-full" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ERROR STATE */}
                {!loading && errorMsg && (
                    <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center max-w-lg mx-auto">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errorMsg}</p>
                        <button onClick={() => fetchEvents()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">
                            Retry Loading
                        </button>
                    </div>
                )}

                {/* EVENTS LIST GRID */}
                {!loading && !errorMsg && events.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {events.map((event) => (
                            <div key={event.id} className="group rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                                <div className="p-5 flex-1">
                                    {/* Event Banner */}
                                    <div className="relative h-48 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 overflow-hidden mb-5">
                                        {event.banner_url ? (
                                            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/40">
                                                <Calendar className="w-12 h-12" />
                                            </div>
                                        )}
                                        {/* Tag banner overlays */}
                                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5 shadow-sm">
                                            <Users size={12} className="text-violet-600" />
                                            <span>{event.attendee_count} attending</span>
                                        </div>
                                    </div>

                                    {/* Event Meta Details */}
                                    <div className="space-y-3">
                                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">{event.title}</h2>

                                        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                            <span>by</span>
                                            <span className="text-zinc-600 dark:text-zinc-400 truncate">{event.organizer_name}</span>
                                        </p>

                                        <div className="pt-2 space-y-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                                <span className="truncate">{formatEventDate(event.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Join Redirect Button */}
                                <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <Link href={`/events/${event.id}`} className="w-full py-3.5 rounded-2xl bg-zinc-50 hover:bg-violet-600 dark:bg-zinc-950 dark:hover:bg-violet-600 text-zinc-700 hover:text-white dark:text-zinc-300 dark:hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer">
                                        Join Meetup
                                        <ArrowRight size={14} className="transform transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !errorMsg && events.length === 0 && (
                    <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-center max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                            <Calendar size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No meetups found</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Try clearing your search parameters or searching for a different city.</p>
                        </div>
                        {(locationFilter || dateFilter) && (
                            <button onClick={handleClearFilters} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
