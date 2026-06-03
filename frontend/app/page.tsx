// Import React and Next.js assets
import React from "react";
// Import Next.js Link component for client-side navigation transitions
import Link from "next/link";
// Import Lucide React icons for modern, minimalist UI indicators
import { 
  ArrowRight, Calendar, Users, Globe, 
  ShieldCheck, Zap, Sparkles, Check, ChevronRight, Activity, ArrowUpRight 
} from "lucide-react";
// Import our verified session checks to dynamically toggle CTAs
import { verifySession } from "@/data-access/auth";
// Import our new dedicated, server-first Header component
import Header from "@/components/Header";

/**
 * HOME / LANDING PAGE FOR GATHR (PREMIUM SAAS REDESIGN)
 * 
 * Analogy:
 * Think of this landing page like the storefront windows of a high-end community center.
 * It explains what the center is for (hosting meetups), shows some of the best features (RSVPs, banners),
 * and has a big clear doorway at the center inviting people to enter (Get Started / Dashboard).
 */
export default async function Home() {
  // 1. Fetch the user session status from the secure Data Access Layer (DAL)
  const session = await verifySession();
  const isLoggedIn = session && session.authenticated;

  return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between font-sans transition-colors duration-300 antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
          {/* 1. Universal Header Navigation Bar */}
          <Header />

          {/* 2. Hero Section: Spacious, high-contrast, centered SaaS layout */}
          <main className="flex-grow">
              {/* HERO CONTAINER */}
              <section className="relative w-full max-w-6xl mx-auto px-6 pt-32 md:pt-40 pb-24 text-center space-y-10">
                  {/* Active Product Badge */}
                  <div className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 px-4 py-2 rounded-full text-xs font-bold text-zinc-800 dark:text-zinc-300 shadow-sm mx-auto animate-fade-in">
                      <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-650 dark:bg-violet-400"></span>
                      </span>
                      <span>Gathr 2.0 is now live</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  </div>

                  {/* Large Hero Typography */}
                  <div className="space-y-6 max-w-4xl mx-auto">
                      <h1 className="text-5xl sm:text-7xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.95]">
                          <span className="text-black dark:text-white">
                              Host unforgettable <span className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">meetups.</span>{" "}
                          </span>
                      </h1>

                      {/* High-Contrast Subheading */}
                      <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-semibold">The minimalist workspace for developers, creators, and organizers to configure, manage, and scale local community meetups. No complexity, just simple RSVPs.</p>
                  </div>

                  {/* CTA Buttons with solid sizing */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto pt-4">
                      {isLoggedIn ? (
                          <Link href="/dashboard" className="h-13 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-zinc-950/10 hover:shadow-zinc-950/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 w-full cursor-pointer">
                              Go to Dashboard
                              <ArrowRight className="w-4 h-4" />
                          </Link>
                      ) : (
                          <>
                              <Link href="/register" className="h-13 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-zinc-950/10 hover:shadow-zinc-950/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 w-full cursor-pointer">
                                  Create Event Free
                                  <ArrowRight className="w-4 h-4" />
                              </Link>
                              <Link href="/login" className="h-13 px-8 rounded-2xl bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800/80 font-bold text-sm transition-all duration-200 flex items-center justify-center w-full cursor-pointer">
                                  Log In
                              </Link>
                          </>
                      )}
                  </div>

                  {/* Premium SaaS Interface Dashboard Mockup */}
                  <div className="pt-16 max-w-5xl mx-auto">
                      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none text-left flex flex-col md:flex-row h-[420px]">
                          {/* Mockup Left Sidebar */}
                          <div className="w-full md:w-56 border-r border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 p-5 hidden md:flex flex-col justify-between shrink-0">
                              <div className="space-y-6">
                                  {/* Mock Workspace Title */}
                                  <div className="flex items-center gap-2.5 px-2">
                                      <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-[10px] font-black text-white dark:text-zinc-900">G</div>
                                      <span className="text-xs font-bold text-zinc-900 dark:text-white">Workspace</span>
                                  </div>

                                  {/* Sidebar Menu Links */}
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-900 dark:text-white rounded-xl text-xs font-bold">
                                          <Activity className="w-4 h-4" />
                                          Dashboard
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-2 text-zinc-500 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                          <Calendar className="w-4 h-4" />
                                          My Events
                                      </div>
                                      <div className="flex items-center gap-2 px-3 py-2 text-zinc-500 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                          <Users className="w-4 h-4" />
                                          Attendees
                                      </div>
                                  </div>
                              </div>

                              {/* Sidebar footer initials avatar */}
                              <div className="flex items-center gap-2 px-2">
                                  <div className="w-7 h-7 rounded-full bg-violet-650 dark:bg-violet-400 flex items-center justify-center text-[10px] font-bold text-white">DF</div>
                                  <div>
                                      <h5 className="text-[10px] font-bold text-zinc-900 dark:text-white">Destiny Franks</h5>
                                      <p className="text-[8px] text-zinc-400">Organizer</p>
                                  </div>
                              </div>
                          </div>

                          {/* Mockup Main Workspace Panel */}
                          <div className="flex-grow p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                              {/* Panel Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-5">
                                  <div>
                                      <h4 className="text-base font-black text-zinc-900 dark:text-white">Lagos Javascript Developer Meetup</h4>
                                      <p className="text-xs font-semibold text-zinc-505 dark:text-zinc-400 mt-0.5">Thursday, June 18 • Lagos, Nigeria</p>
                                  </div>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      Live / Published
                                  </span>
                              </div>

                              {/* Panel Stats Widgets */}
                              <div className="grid grid-cols-3 gap-4 pt-6">
                                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60">
                                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Registrations</p>
                                      <div className="flex items-baseline gap-1.5 mt-1">
                                          <span className="text-xl font-black text-zinc-900 dark:text-white">142</span>
                                          <span className="text-[9px] font-bold text-emerald-600 flex items-center">
                                              <ArrowUpRight className="w-2.5 h-2.5" /> +28
                                          </span>
                                      </div>
                                  </div>
                                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60">
                                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Capacity Used</p>
                                      <div className="flex items-baseline gap-1.5 mt-1">
                                          <span className="text-xl font-black text-zinc-900 dark:text-white">71.2%</span>
                                          <span className="text-[9px] font-semibold text-zinc-500">Max 200</span>
                                      </div>
                                  </div>
                                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60">
                                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Drafts Created</p>
                                      <div className="flex items-baseline gap-1.5 mt-1">
                                          <span className="text-xl font-black text-zinc-900 dark:text-white">4</span>
                                          <span className="text-[9px] font-semibold text-zinc-500">In cabinet</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Mockup Guest list row */}
                              <div className="border border-zinc-150 dark:border-zinc-800/65 rounded-xl p-4 bg-zinc-50/20 dark:bg-zinc-950/10 flex items-center justify-between mt-6">
                                  <div className="flex items-center gap-3">
                                      <div className="flex -space-x-2">
                                          <div className="w-6 h-6 rounded-full bg-violet-650 text-[8px] font-bold text-white flex items-center justify-center border border-white">DF</div>
                                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-[8px] font-bold text-white flex items-center justify-center border border-white">TO</div>
                                          <div className="w-6 h-6 rounded-full bg-zinc-800 text-[8px] font-bold text-white flex items-center justify-center border border-white">AJ</div>
                                      </div>
                                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">142 community members attending</span>
                                  </div>
                                  <div className="flex gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* 3. Features Section: Grid cards with premium design principles */}
              <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200/50 dark:border-zinc-850/50 py-28">
                  <div className="max-w-6xl mx-auto px-6 space-y-20">
                      {/* Header description */}
                      <div className="text-center space-y-4 max-w-xl mx-auto">
                          <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Designed for community managers.</h2>
                          <p className="text-sm font-semibold text-zinc-505 dark:text-zinc-400 leading-relaxed">Configure cover banners, register drafts, check guest attendance logs, and modify event details dynamically.</p>
                      </div>

                      {/* Feature Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                          {/* Feature 1: Lightning Fast */}
                          <div className="p-6 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-850/60 rounded-3xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                  <Zap className="w-5 h-5 text-violet-650 dark:text-violet-400" />
                              </div>
                              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Minimalist Scheduler</h3>
                              <p className="text-xs font-semibold text-zinc-500 leading-relaxed dark:text-zinc-400">Post and publish event invites with a sleek cover image, date/time parameters, and location tags in under two minutes.</p>
                          </div>

                          {/* Feature 2: Attendance Tracking */}
                          <div className="p-6 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-850/60 rounded-3xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                  <Users className="w-5 h-5 text-violet-650 dark:text-violet-400" />
                              </div>
                              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Live RSVP Counters</h3>
                              <p className="text-xs font-semibold text-zinc-500 leading-relaxed dark:text-zinc-400">Track attendee registrations instantly. Watch metrics counters increment automatically as guests click RSVP cards.</p>
                          </div>

                          {/* Feature 3: Secure API view protection */}
                          <div className="p-6 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-850/60 rounded-3xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-750 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                  <ShieldCheck className="w-5 h-5 text-violet-650 dark:text-violet-400" />
                              </div>
                              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ownership Controls</h3>
                              <p className="text-xs font-semibold text-zinc-500 leading-relaxed dark:text-zinc-400">Cross-origin secure cookies and strict owner filters prevent anyone but you from accessing or modifying your drafts.</p>
                          </div>
                      </div>
                  </div>
              </section>

              {/* 4. Action Steps Section */}
              <section className="py-28 max-w-6xl mx-auto px-6 space-y-20">
                  <div className="text-center space-y-4 max-w-xl mx-auto">
                      <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">Simple steps to launch.</h2>
                      <p className="text-sm font-semibold text-zinc-505 dark:text-zinc-400 leading-relaxed">No bloated setup workflows. Simply plan, publish, and gather.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Step 1 */}
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-3xl space-y-4 relative hover:-translate-y-0.5 transition-all shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">1</div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-white pt-2">Publish your Flyer</h4>
                          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">Add event details, write descriptions, and upload banner graphics. Check the toggle to make it live instantly.</p>
                      </div>

                      {/* Step 2 */}
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-3xl space-y-4 relative hover:-translate-y-0.5 transition-all shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">2</div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-white pt-2">Distribute the link</h4>
                          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">Share your public meetup details page with your networks. Guests register with a single click in their browsers.</p>
                      </div>

                      {/* Step 3 */}
                      <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-3xl space-y-4 relative hover:-translate-y-0.5 transition-all shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black">3</div>
                          <h4 className="text-lg font-bold text-zinc-900 dark:text-white pt-2">Inspect the lists</h4>
                          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed">Access your metrics overview to track signups, manage cover files, and review attendee totals in your control panel.</p>
                      </div>
                  </div>
              </section>

              {/* 5. Bottom Call to Action Section */}
              <section className="max-w-5xl mx-auto px-6 pb-28">
                  <div className="p-10 sm:p-16 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-center space-y-6 shadow-xl">
                      <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-xl mx-auto leading-none">Start gathering your community.</h2>
                      <p className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 max-w-md mx-auto leading-relaxed">Create an event dashboard catalog, configure community events lists, and start gathering RSVPs without complexity.</p>
                      <div className="pt-2">
                          {isLoggedIn ? (
                              <Link href="/dashboard" className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-white dark:bg-zinc-900 text-zinc-955 dark:text-white rounded-2xl text-xs font-extrabold hover:shadow-md transition-all cursor-pointer">
                                  Open Event Dashboard
                                  <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                          ) : (
                              <Link href="/register" className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-white dark:bg-zinc-900 text-zinc-955 dark:text-white rounded-2xl text-xs font-extrabold hover:shadow-md transition-all cursor-pointer">
                                  Get Started for Free
                                  <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                          )}
                      </div>
                  </div>
              </section>
          </main>

          {/* 6. Footer Layout */}
          <footer className="w-full border-t border-zinc-200/50 dark:border-zinc-850/50 bg-white/40 dark:bg-zinc-900/10">
              <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                      <span className="text-lg font-black tracking-tight text-zinc-905 dark:text-white">gathr.</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-650 dark:bg-violet-400 animate-pulse"></span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center md:text-left">&copy; {new Date().getFullYear()} Gathr Technologies. Designed for master event organizers. All rights reserved.</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                      <Link href="/events" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                          Browse
                      </Link>
                      <span className="text-zinc-200 dark:text-zinc-800">|</span>
                      <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                          Dashboard
                      </Link>
                  </div>
              </div>
          </footer>
      </div>
  );
}
