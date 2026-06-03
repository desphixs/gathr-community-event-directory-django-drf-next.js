'use client';

// Import React hooks for client state and side effects
import React, { useState } from 'react';
// Import Next.js routing hook to navigate after successful event creation
import { useRouter } from 'next/navigation';
// Import Lucide icons for styling our form interface
import { Loader2, Upload, Calendar, MapPin, AlignLeft, HelpCircle } from 'lucide-react';
// Import our dashboard wrapper layout scaffolding
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';
// Import our frontend actions for communicating with the Django backend
import { getEventCloudinarySignatureAction, createEventAction } from '@/app/actions/events/events';

/**
 * CREATE EVENT FORM PAGE
 * 
 * Analogy:
 * Think of this page like writing a physical newsletter notice at a desk.
 * You fill in all the details (the title, location, description, date),
 * paste an optional photo banner, check if there are spelling errors (validation),
 * and pin it on the community wall (the backend database).
 * To upload the photo safely, we ask the manager for a secure permission stamp (Cloudinary signature)
 * and upload the photo directly to the image storage warehouse (Cloudinary) before writing the photo URL
 * on the physical notice card.
 */
export default function CreateEventPage() {
    const router = useRouter();

    // 1. Core State Hook Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    
    // File upload states
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string>('');
    
    // UI feedback states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // 2. Handle file picker selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            // CreateObjectURL generates a temporary web link pointing to the local image on the user's hard drive
            // so we can display an instant preview on the screen before actually uploading it!
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    // 3. Form submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        // Prevent default browser page reloading on form submission
        e.preventDefault();
        
        // Start loading status and clear previous error messages
        setLoading(true);
        setError(null);

        try {
            let bannerUrl = '';

            // Step 1: Upload banner image directly to Cloudinary if a file was picked
            if (bannerFile) {
                // Fetch the secure upload permit credentials from our Django server
                const signatureRes = await getEventCloudinarySignatureAction();
                if (!signatureRes.success || !signatureRes.signatureData) {
                    throw new Error(signatureRes.message || "Failed to generate Cloudinary signature token.");
                }

                const sigData = signatureRes.signatureData;

                // Build a FormData payload to submit the binary image to Cloudinary's servers
                // FormData simulates an HTML form upload so we can send raw file assets
                const formData = new FormData();
                formData.append('file', bannerFile);
                formData.append('timestamp', sigData.timestamp.toString());
                formData.append('signature', sigData.signature);
                formData.append('api_key', sigData.api_key);
                formData.append('folder', sigData.folder);

                // Dispatch the POST request directly to the Cloudinary API endpoint
                const cloudinaryRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
                    {
                        method: 'POST',
                        body: formData, // Browser sets multipart/form-data headers automatically
                    }
                );

                if (!cloudinaryRes.ok) {
                    throw new Error("Failed to upload banner image to Cloudinary storage server.");
                }

                const cloudinaryData = await cloudinaryRes.json();
                bannerUrl = cloudinaryData.secure_url;
            }

            // Step 2: Dispatch the event textual payload to our backend create action
            const eventPayload = {
                title,
                description,
                location,
                date,
                banner_url: bannerUrl, // Pass empty string if no image was uploaded
            };

            const createRes = await createEventAction(eventPayload);

            if (!createRes.success) {
                throw new Error(createRes.message || "Failed to save the event record.");
            }

            // Step 3: Set success state and redirect user back to their dashboard list
            setSuccess(true);
            router.push('/dashboard/events');
            
        } catch (err: any) {
            // If any step in the pipeline breaks, capture the error message to display in the UI alert box
            setError(err.message || "An unexpected error occurred during submission.");
            setLoading(false);
        }
    };

    return (
        <DashboardWrapper>
            <div className="max-w-3xl mx-auto py-4">
                {/* Headers Title */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Create New Meetup
                    </h1>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        Fill out the details below to publish a new event and share it with the Gathr community.
                    </p>
                </div>

                {/* Form view cards container */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 lg:p-8 shadow-xl shadow-zinc-150/10 dark:shadow-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Event Title Input */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Event Title
                            </label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Lagos Javascript Developer Hackathon" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* Event Description Input */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Description
                            </label>
                            <div className="relative">
                                <textarea 
                                    required
                                    rows={5}
                                    placeholder="Explain what attendees should expect, prerequisites, agenda, and schedules..." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60 resize-none"
                                />
                            </div>
                        </div>

                        {/* Location and Date Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* City / Location Input */}
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
                                        disabled={loading}
                                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {/* Event Date and Time picker Input */}
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
                                        disabled={loading}
                                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Banner Image Uploader Input */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                Event Banner Cover Image
                            </label>
                            
                            {/* Local Image Preview Section */}
                            {bannerPreview && (
                                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 mb-3 animate-in fade-in duration-300">
                                    <img 
                                        src={bannerPreview} 
                                        alt="Banner Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Clickable drag-drop dash border label */}
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-violet-500 dark:hover:border-violet-500/50 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-all duration-200 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <Upload className="w-8 h-8 text-zinc-400 group-hover:text-violet-500 transition-colors mb-2" />
                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                        Click to upload image file
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
                                        PNG, JPG, JPEG up to 5MB
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                    className="hidden" 
                                />
                            </label>
                        </div>

                        {/* Submission Buttons Block */}
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-750 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 disabled:-translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Publishing Meetup...
                                    </>
                                ) : (
                                    'Publish Event'
                                )}
                            </button>
                        </div>

                        {/* Error Alert Box Banner */}
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center animate-in fade-in slide-in-from-top-1 duration-300">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">
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
