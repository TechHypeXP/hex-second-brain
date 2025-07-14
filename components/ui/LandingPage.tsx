"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import CloudBackground from "./CloudBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      {/* Background animation placeholder */}
      <CloudBackground />

      <main className="relative z-10 flex flex-col items-center justify-center flex-grow text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Your Knowledge, Amplified.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-xl md:text-2xl mb-8 max-w-2xl"
        >
          Organize, process, and retrieve your resources with the power of AI.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Link
            href="/dashboard"
            className="bg-white text-blue-800 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="relative z-10 py-6 text-sm text-gray-300"
      >
        &copy; {new Date().getFullYear()} Second Brain. All rights reserved.
      </motion.footer>
    </div>
  );
}
