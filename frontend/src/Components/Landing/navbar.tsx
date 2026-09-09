"use client";

import type { MouseEvent } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#roles", label: "Roles" },
  { href: "#preview", label: "Dashboard" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    const section = document.querySelector(href);

    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fbfcfb]/95 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#home"
          className="flex items-center gap-3"
          aria-label="SalaryFlow home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#165c55] text-sm font-bold text-white">
            SF
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-800">
            SalaryFlow
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => scrollToSection(event, link.href)}
              className="text-sm font-medium text-slate-600 transition hover:text-[#165c55]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="/Login"
          className="rounded-lg bg-[#165c55] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#104943]"
        >
          Sign in
        </a>
      </nav>
    </header>
  );
}
