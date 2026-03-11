import React from "react";
import { Link } from "react-router-dom";

const SYSTEMS = [
  {
    name: "D&D 5th Edition",
    accent: "border-dnd-red",
    icon: "⚔",
    iconBg: "bg-dnd-red",
    desc: "Build and run encounters using the D&D 5e XP budget system with the official DMG multiplier table.",
    features: [
      "Monster Manual + 14 additional sourcebook bestiary",
      "Import homebrew JSON files in 5etools format",
      "Official XP multiplier (1 monster ×1 → 15+ ×4), scaled for party size",
      "Easy / Medium / Hard / Deadly difficulty tiers",
      "Per-monster HP tracking (individual instance bars)",
      "GM feature reveal: individually toggle resistances, traits, actions for players",
      "Player view with abstract HP conditions and monster images",
    ],
  },
  {
    name: "Pathfinder 2nd Edition",
    accent: "border-amber-600",
    icon: "⚙",
    iconBg: "bg-amber-700",
    desc: "Build encounters using PF2e's XP budget system — each creature costs XP based on its level relative to the party.",
    features: [
      "25 creatures from Bestiary 1 spanning levels −1 to 19",
      "XP cost by creature level delta: same level = 40 XP, +4 levels = 160 XP",
      "Low / Moderate / Severe / Extreme difficulty tiers, scaled for party size",
      "Three-action economy display (◆ ◆◆ ◆◆◆ ↺ ◇) in stat blocks",
      "AC, Fortitude / Reflex / Will saves in the card view",
      "Weaknesses with specific damage values (e.g. Fire 10)",
      "Per-creature GM feature reveal + parchment player view",
    ],
  },
];

function About() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="page-title">About</h1>
        <p className="text-dnd-text/60 text-sm">
          A multi-system encounter assistant for tabletop RPG Game Masters.
        </p>
      </div>

      {SYSTEMS.map((sys) => (
        <section key={sys.name} className={`panel-parchment p-5 border-l-4 ${sys.accent}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full ${sys.iconBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
              {sys.icon}
            </div>
            <h2 className="font-display text-dnd-brown font-bold text-lg">{sys.name}</h2>
          </div>
          <p className="text-dnd-brown/80 text-sm mb-3">{sys.desc}</p>
          <ul className="space-y-1">
            {sys.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dnd-brown">
                <span className="text-dnd-red font-bold mt-0.5 shrink-0">✦</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="panel-parchment p-5">
        <h2 className="font-display text-dnd-brown font-bold text-lg border-b-2 border-dnd-red pb-2 mb-3">
          Data &amp; Licensing
        </h2>
        <div className="space-y-2 text-dnd-brown text-sm">
          <p>
            <strong>D&amp;D 5e</strong> monster data is sourced from{" "}
            <strong>5etools</strong> (community-maintained reference). Dungeons &amp; Dragons is a
            trademark of <strong>Wizards of the Coast LLC</strong>.
          </p>
          <p>
            <strong>Pathfinder 2e</strong> creature data is derived from the{" "}
            <strong>Pathfinder Second Edition Bestiary</strong>, published by Paizo Inc.
            Pathfinder is a trademark of Paizo Inc. Stats used under the{" "}
            <strong>ORC License</strong> / <strong>Community Use Policy</strong>.
          </p>
          <p className="text-dnd-brown/50 text-xs italic mt-2">
            This tool is unofficial and not affiliated with Wizards of the Coast or Paizo Inc.
          </p>
        </div>
      </section>

      <div className="text-center">
        <Link to="/" className="btn-dnd-primary no-underline">
          Start Building Encounters
        </Link>
      </div>
    </div>
  );
}

export default About;
