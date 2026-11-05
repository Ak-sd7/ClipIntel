"use client";
import { Galaxy, CircleUser } from "lucide-react";
import Link from "next/link";

const Nav = () => {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Galaxy className="text-indigo-600" strokeWidth={2} size={32} />
          <span className="font-chokokutai text-2xl font-semibold text-slate-900">
            ClipIntel
          </span>
        </Link>

        <button
          type="button"
          aria-label="Account"
          className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <CircleUser size={30} strokeWidth={1.75} />
        </button>
      </nav>
    </header>
  );
};

export default Nav;