"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Menu, X, Sparkles, LogIn, HeartHandshake, Compass, Brain, Users } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy/5 bg-cream/95 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-left transition hover:opacity-80 cursor-pointer"
        >
          <Logo showTagline />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#ambientes"
            className="text-xs font-bold uppercase tracking-widest text-navy/70 transition hover:text-navy cursor-pointer flex items-center gap-2"
          >
            Ambientes
          </a>
          <a
            href="#vibe"
            className="text-xs font-bold uppercase tracking-widest text-navy/70 transition hover:text-navy cursor-pointer flex items-center gap-2"
          >
            Economia VIBE
          </a>
          <a
            href="#sentinela"
            className="text-xs font-bold uppercase tracking-widest text-navy/70 transition hover:text-navy cursor-pointer flex items-center gap-2"
          >
            Sentinela
          </a>
          <a
            href="#profissionais"
            className="text-xs font-bold uppercase tracking-widest text-navy/70 transition hover:text-navy cursor-pointer flex items-center gap-2"
          >
            Profissionais
          </a>
          
          <div className="h-4 w-px bg-navy/20 mx-2"></div>
          
          <Link
            href="/login"
            className="text-sm font-semibold text-navy transition hover:text-navy/70 cursor-pointer flex items-center gap-2"
          >
            <LogIn className="size-4" />
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="group relative flex items-center gap-2 rounded-full border border-navy px-5 py-2 text-sm font-bold text-navy transition-all hover:bg-navy hover:text-cream cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="size-4 text-mint transition-colors group-hover:text-mint" />
              Começar agora
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full bg-navy/5 p-2 text-navy transition hover:bg-navy/10 md:hidden cursor-pointer"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[100%] left-0 right-0 border-b border-navy/10 bg-cream p-6 shadow-xl md:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-6">
            <a
              href="#ambientes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-display text-navy cursor-pointer"
            >
              <Compass className="size-5 text-mint" strokeWidth={1.5} />
              Ambientes
            </a>
            <a
              href="#vibe"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-display text-navy cursor-pointer"
            >
              <Users className="size-5 text-mint" strokeWidth={1.5} />
              Economia VIBE
            </a>
            <a
              href="#sentinela"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-display text-navy cursor-pointer"
            >
              <Brain className="size-5 text-mint" strokeWidth={1.5} />
              Sentinela
            </a>
            <a
              href="#profissionais"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-display text-navy cursor-pointer"
            >
              <HeartHandshake className="size-5 text-mint" strokeWidth={1.5} />
              Para Profissionais
            </a>
            
            <div className="my-2 h-px w-full bg-navy/10"></div>
            
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-navy/20 bg-transparent py-3 text-center text-sm font-bold text-navy cursor-pointer"
            >
              <LogIn className="size-4" />
              Entrar
            </Link>

            <Link
              href="/cadastro"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-center text-sm font-bold text-cream shadow-md cursor-pointer"
            >
              <Sparkles className="size-4 text-mint" />
              Começar agora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
