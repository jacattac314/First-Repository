"use client";

import Link from "next/link";
import { useState } from "react";

const PHONE_NUMBER = "(555) 123-4567"; // Replace with actual number

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b-2 border-neutral-200 sticky top-0 z-50 shadow-sm">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-2"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary">
              🦸 Odd Job Heroes
            </span>
          </Link>

          {/* Desktop Navigation - Max 4 items as per architecture */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/services"
              className="text-lg font-medium text-neutral-700 hover:text-primary px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="text-lg font-medium text-neutral-700 hover:text-primary px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Pricing
            </Link>
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
              className="text-lg font-medium text-neutral-700 hover:text-primary px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center space-x-2"
            >
              <span className="text-xl">📞</span>
              <span>Call Us</span>
            </a>
            <Link href="/book" className="btn btn-primary">
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-lg text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 space-y-4 border-t border-neutral-200">
            <Link
              href="/services"
              className="block text-xl font-medium text-neutral-700 hover:text-primary px-4 py-3 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="block text-xl font-medium text-neutral-700 hover:text-primary px-4 py-3 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <a
              href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
              className="block text-xl font-medium text-neutral-700 hover:text-primary px-4 py-3 rounded-lg transition-colors"
            >
              📞 Call {PHONE_NUMBER}
            </a>
            <Link
              href="/book"
              className="block btn btn-primary w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
