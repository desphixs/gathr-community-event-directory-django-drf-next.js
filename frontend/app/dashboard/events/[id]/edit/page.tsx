'use client';

// Import React hooks for managing state and page mount side effects
import React, { useState, useEffect } from 'react';
// Import routing and navigation hooks from Next.js
import { useRouter, useParams } from 'next/navigation';
// Import Lucide React icons for modern look and feel
import { Loader2, Upload, Calendar, MapPin, Trash2, ArrowLeft } from 'lucide-react';
// Import Next.js Link component for transitions
import Link from 'next/link';
// Import our dashboard Wrapper component for sidebar layout consistency
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import our server actions for fetching details, updating, deleting, and Cloudinary signing
import { 
    getOrganizerEventDetailAction, 
    updateOrganizerEventAction, 
    deleteOrganizerEventAction, 
    getEventCloudinarySignatureAction 
} from '@/app/actions/events/events';

/**
 * EDIT ORGANIZER EVENT PAGE
 * 
 * Analogy:
 * Think of this page like retrieving a flyer you previously pinned on the board.
 * You pull it down to make edits (prefilled details).
 * - If you want to rewrite some parts, you change the text inputs and submit (PUT).
 * - If you want to change the picture cover, you upload a new photo to the Cloudinary store.
 * - If you decide the event is cancelled, you click the delete trash icon to shred the flyer permanently.
 */
export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = Number(params.id);

    // 1. Event Input Fields state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [existingBannerUrl, setExistingBannerUrl] = useState('');
    const [isPublished, setIsPublished] = useState(true);

    // 2. Banner uploader state variables
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>('');

    // 3. Page control and loader state triggers
    const [pageLoading, setPageLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper: Format ISO date string into 'YYYY-MM-DDTHH:MM' required by datetime-local input type
    const formatISOToDatetimeLocal = (isoString: string) => {
        if (!isoString) return '';
        try {
            const d = new Date(isoString);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    // Load existing event data when the page mounts
    useEffect(() => {
        async function fetchEventDetails() {
            try {
                setPageLoading(true);
                setError(null);
                
                // Fetch the event using the organizer-only detail server action
                const res = await getOrganizerEventDetailAction(eventId);
                
                if (res.success && res.event) {
                    // Populate input states with current values from the database
                    setTitle(res.event.title);
                    setDescription(res.event.description);
                    setLocation(res.event.location);
                    setDate(formatISOToDatetimeLocal(res.event.date));
                    setExistingBannerUrl(res.event.banner_url || '');
                    setBannerPreview(res.event.banner_url || '');
                    setIsPublished(res.event.is_published);
                } else {
                    setError(res.message || "Failed to load event details.");
                }
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred while loading.");
            } finally {
                setPageLoading(false);
            }
        }
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    // Handle new banner photo selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            // Create a temporary local URL to show preview on screen instantly
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    // Form submission update handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);

        try {
            let bannerUrl = existingBannerUrl;

            // Step 1: Upload a new banner image to Cloudinary if selected
            if (bannerFile) {
                const signatureRes = await getEventCloudinarySignatureAction();
                if (!signatureRes.success || !signatureRes.signatureData) {
                    throw new Error(signatureRes.message || "Failed to generate Cloudinary signature token.");
                }

                const sigData = signatureRes.signatureData;
                const formData = new FormData();
                formData.append('file', bannerFile);
                formData.append('timestamp', sigData.timestamp.toString());
                formData.append('signature', sigData.signature);
                formData.append('api_key', sigData.api_key);
                formData.append('folder', sigData.folder);

                const cloudinaryRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!cloudinaryRes.ok) {
                    throw new Error("Failed to upload banner image to Cloudinary storage server.");
                }

                const cloudinaryData = await cloudinaryRes.json();
                bannerUrl = cloudinaryData.secure_url;
            }

            // Step 2: Dispatch the updated payload to our backend server action
            const updatePayload = {
                title,
                description,
                location,
                date,
                banner_url: bannerUrl,
                is_published: isPublished
            };

            const updateRes = await updateOrganizerEventAction(eventId, updatePayload);
            if (!updateRes.success) {
                throw new Error(updateRes.message || "Failed to save the event record.");
            }

            // Step 3: Redirect to dashboard events directory on success
            router.push('/dashboard/events');
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during update.");
            setSubmitLoading(false);
        }
    };

    // Permanent delete handler
    const handleDelete = async () => {
        setDeleteLoading(true);
        setError(null);
        try {
            // Execute the delete server action
            const res = await deleteOrganizerEventAction(eventId);
            if (res.success) {
                // Redirect back to events list
                router.push('/dashboard/events');
            } else {
                setError(res.message || "Failed to delete the event.");
                setDeleteLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during deletion.");
            setDeleteLoading(false);
        }
    };

    // Render loading screen during initial API fetch
    if (pageLoading) {
        return (
            <DashboardWrapper>
                <div className="flex flex-col items-center justify-center py-40">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading event editor...</p>
                </div>
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper>
            <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6">
                {/* Back button and page headers */}
                <div className="mb-8 space-y-4">
                    <Link href="/dashboard/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Events
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                                Edit Meetup Details
                            </h1>
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                                Update the form fields below to edit your event flyer.
                            </p>
                        </div>
                        
                        {/* Delete Event trigger button */}
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200/50 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Event
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Alert Prompt */}
                {showDeleteConfirm && (
                    <div className="mb-6 p-5 bg-red-50 dark:bg-red-950/25 border border-red-100 dark:border-red-900/30 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Are you absolutely sure?</h3>
                        <p className="text-xs text-red-650 dark:text-red-400 mt-1">
                            This will permanently delete this meetup flyer and all guest attendee registrations from the database. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <button
                                disabled={deleteLoading}
                                onClick={handleDelete}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Yes, Delete Permanently'
                                )}
                            </button>
                            <button
                                disabled={deleteLoading}
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Form fields layout card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 lg:p-8 shadow-xl shadow-zinc-150/10 dark:shadow-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Event Title */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Event Title
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Lagos Javascript Developer Hackathon" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={submitLoading}
                                className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Description
                            </label>
                            <textarea 
                                required
                                rows={5}
                                placeholder="Explain what attendees should expect..." 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={submitLoading}
                                className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60 resize-none"
                            />
                        </div>

                        {/* Location and Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Location City */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    City / Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Lagos, Nigeria" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        disabled={submitLoading}
                                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Event Date and Calendar Time */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    Event Date and Time
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        disabled={submitLoading}
                                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Published Status Toggle */}
                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
                            <input 
                                type="checkbox" 
                                id="isPublished"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                disabled={submitLoading}
                                className="w-4 h-4 text-violet-650 border-zinc-300 dark:border-zinc-800 rounded focus:ring-violet-500 cursor-pointer"
                            />
                            <label htmlFor="isPublished" className="text-xs font-bold text-zinc-700 dark:text-zinc-350 uppercase tracking-wider cursor-pointer select-none">
                                Publish event immediately (visible to the public)
                            </label>
                        </div>

                        {/* Banner Image Uploader */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Event Banner Cover Image
                            </label>
                            
                            {bannerPreview && (
                                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 mb-3 animate-in fade-in duration-300">
                                    <img 
                                        src={bannerPreview} 
                                        alt="Banner Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500/50 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-all duration-200 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <Upload className="w-8 h-8 text-zinc-400 group-hover:text-violet-500 transition-colors mb-2" />
                                    <p className="text-xs font-bold text-zinc-650 dark:text-zinc-400">
                                        Click to change banner image
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1 uppercase tracking-wider font-semibold">
                                        Keep empty to retain existing cover image
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={submitLoading}
                                    className="hidden" 
                                />
                            </label>
                        </div>

                        {/* Submission triggers */}
                        <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-4">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex-grow py-4 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:-translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>

                        {/* Error Alert messaging */}
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center animate-in fade-in slide-in-from-top-1 duration-300">
                                <p className="text-xs font-bold text-red-650 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </DashboardWrapper>
    );
}
