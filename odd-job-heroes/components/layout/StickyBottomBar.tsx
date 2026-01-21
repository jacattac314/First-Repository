"use client";

import Link from "next/link";

const PHONE_NUMBER = "(555) 123-4567";

export default function StickyBottomBar() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-neutral-200 shadow-lg">
      <div className="grid grid-cols-4 gap-1 p-2">
        {/* Call */}
        <a
          href={`tel:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
          className="flex flex-col items-center justify-center py-3 px-2 text-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-2xl mb-1">📞</span>
          <span className="text-sm font-medium text-neutral-700">Call</span>
        </a>

        {/* Book */}
        <Link
          href="/book"
          className="flex flex-col items-center justify-center py-3 px-2 text-center rounded-lg bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-2xl mb-1">📅</span>
          <span className="text-sm font-semibold">Book</span>
        </Link>

        {/* Upload Photo */}
        <Link
          href="/book?step=photo"
          className="flex flex-col items-center justify-center py-3 px-2 text-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-2xl mb-1">📸</span>
          <span className="text-sm font-medium text-neutral-700">Photo</span>
        </Link>

        {/* Text/SMS */}
        <a
          href={`sms:${PHONE_NUMBER.replace(/[^0-9]/g, "")}`}
          className="flex flex-col items-center justify-center py-3 px-2 text-center rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="text-2xl mb-1">💬</span>
          <span className="text-sm font-medium text-neutral-700">Text</span>
        </a>
      </div>
    </div>
  );
}
