"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[#004189] text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          DocuScan
        </Link>
        <div className="space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#C5161D] transition-colors">
            Home
          </Link>
          <Link href="/upload" className="hover:text-[#C5161D] transition-colors">
            Upload
          </Link>
          <Link href="/about" className="hover:text-[#C5161D] transition-colors">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
