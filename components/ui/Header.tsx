"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 flex justify-between items-center"
    >
      <div className="text-2xl font-bold">Second Brain</div>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href="/debate-prep" className="hover:underline">
              Debate Prep
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:underline">
              Operational Dashboard
            </Link>
          </li>
          <li>
            <Link href="/report" className="hover:underline">
              Interactive Report
            </Link>
          </li>
          <li>
            <Link href="/sandbox" className="hover:underline">
              Ingestion Sandbox
            </Link>
          </li>
        </ul>
      </nav>
    </motion.header>
  );
}
