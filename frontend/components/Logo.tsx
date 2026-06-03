import React from "react";
import Link from "next/link";

/**
 * BRAND LOGO COMPONENT
 *
 * Analogy:
 * Think of this like the main metal seal placed at the entrance of our hotel lobby.
 * It houses the Calendar symbol inside, and links guests back
 * to the landing homepage whenever clicked.
 */
export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2.5 group">
            {/* Brand Logo Image from Flaticon */}
            <img 
                src="https://cdn-icons-png.flaticon.com/128/12519/12519597.png" 
                alt="Gathr Logo" 
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            {/* Brand title text with tight tracking and bold design */}
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                Gathr
            </span>
        </Link>
    );
}
