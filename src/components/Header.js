import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const MODES = [
  { id: "5e",   label: "D&D 5e",         icon: "⚔" },
  { id: "pf2e", label: "Pathfinder 2e",  icon: "⚙" },
];

function Header({ mode, setMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks5e = [
    { to: "/",         label: "Builder",  end: true },
    { to: "/encounter",label: "Encounter" },
    { to: "/import",   label: "Sources"   },
    { to: "/about",    label: "About"     },
  ];

  const navLinksPF2e = [
    { to: "/",              label: "Builder",  end: true },
    { to: "/pf2e-encounter",label: "Encounter" },
    { to: "/about",         label: "About"     },
  ];

  const links = mode === "5e" ? navLinks5e : navLinksPF2e;
  const accentColor = mode === "pf2e" ? "border-amber-500/40" : "border-dnd-gold/40";

  return (
    <header className={`bg-dnd-darker border-b-2 ${accentColor} shadow-dnd sticky top-0 z-50`}>
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group no-underline shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors duration-150 ${
            mode === "pf2e"
              ? "bg-amber-700 group-hover:bg-amber-600"
              : "bg-dnd-red group-hover:bg-dnd-red-light"
          }`}>
            <span className="text-white font-display font-bold text-lg leading-none">
              {mode === "pf2e" ? "⚙" : "⚔"}
            </span>
          </div>
          <div>
            <h1 className={`font-display font-bold text-lg leading-tight tracking-wide transition-colors duration-150 ${
              mode === "pf2e"
                ? "text-amber-400 group-hover:text-amber-300"
                : "text-dnd-gold group-hover:text-dnd-gold/80"
            }`}>
              {mode === "pf2e" ? "PF2e Encounter Assistant" : "5e Encounter Assistant"}
            </h1>
            <p className="text-dnd-text/40 text-xs leading-none font-body">
              {mode === "pf2e" ? "Pathfinder 2nd Edition" : "D&D 5th Edition"}
            </p>
          </div>
        </Link>

        {/* Game system switcher — desktop */}
        <div className="hidden md:flex items-center bg-black/30 rounded-lg p-1 border border-dnd-gold/20 shrink-0">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleModeSwitch(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold transition-all duration-150 ${
                mode === m.id
                  ? m.id === "pf2e"
                    ? "bg-amber-700 text-white shadow-sm"
                    : "bg-dnd-red text-white shadow-sm"
                  : "text-dnd-text/50 hover:text-dnd-text/80 hover:bg-white/5"
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to + label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `font-display text-sm px-3 py-2 rounded transition-colors duration-150 ${
                  isActive
                    ? mode === "pf2e"
                      ? "text-amber-400 bg-amber-900/20"
                      : "text-dnd-gold bg-dnd-gold/10"
                    : "text-dnd-text/70 hover:text-dnd-gold hover:bg-dnd-gold/5"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-dnd-gold p-2 rounded hover:bg-dnd-gold/10 transition-colors shrink-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-dnd-gold/20 px-4 py-3 flex flex-col gap-2">
          {/* Mode switcher mobile */}
          <div className="flex gap-2 mb-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSwitch(m.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-display font-semibold border transition-all ${
                  mode === m.id
                    ? m.id === "pf2e"
                      ? "bg-amber-700 text-white border-amber-600"
                      : "bg-dnd-red text-white border-dnd-red"
                    : "border-dnd-text/20 text-dnd-text/50"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {links.map(({ to, label, end }) => (
            <NavLink
              key={to + label}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `font-display text-sm px-3 py-2 rounded transition-colors ${
                  isActive ? "text-dnd-gold bg-dnd-gold/10" : "text-dnd-text/70 hover:text-dnd-gold"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

export default Header;
