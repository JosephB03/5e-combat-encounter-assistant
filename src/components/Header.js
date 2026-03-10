import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-dnd-darker border-b-2 border-dnd-gold/40 shadow-dnd sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo / Title */}
        <Link to="/" className="flex items-center gap-3 group no-underline">
          <div className="w-9 h-9 rounded-full bg-dnd-red flex items-center justify-center shadow-lg group-hover:bg-dnd-red-light transition-colors duration-150">
            <span className="text-white font-display font-bold text-lg leading-none">⚔</span>
          </div>
          <div>
            <h1 className="font-display text-dnd-gold font-bold text-lg leading-tight tracking-wide group-hover:text-dnd-gold/80 transition-colors duration-150">
              5e Encounter Assistant
            </h1>
            <p className="text-dnd-text/40 text-xs leading-none font-body">
              D&amp;D 5th Edition
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                isActive
                  ? "text-dnd-gold bg-dnd-gold/10"
                  : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
              }`
            }
          >
            Builder
          </NavLink>
          <NavLink
            to="/encounter"
            className={({ isActive }) =>
              `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                isActive
                  ? "text-dnd-gold bg-dnd-gold/10"
                  : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
              }`
            }
          >
            Encounter
          </NavLink>
          <NavLink
            to="/import"
            className={({ isActive }) =>
              `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                isActive
                  ? "text-dnd-gold bg-dnd-gold/10"
                  : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
              }`
            }
          >
            Sources
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                isActive
                  ? "text-dnd-gold bg-dnd-gold/10"
                  : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
              }`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-dnd-gold p-2 rounded hover:bg-dnd-gold/10 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-dnd-gold/20 px-4 py-2 flex flex-col gap-1">
          {[
            { to: "/", label: "Builder", end: true },
            { to: "/encounter", label: "Encounter" },
            { to: "/import", label: "Sources" },
            { to: "/about", label: "About" },
          ].map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                  isActive
                    ? "text-dnd-gold bg-dnd-gold/10"
                    : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
