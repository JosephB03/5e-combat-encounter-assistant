import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="page-title">About</h1>
        <p className="text-dnd-text/60 text-sm">
          5e Encounter Assistant — a tool for Dungeon Masters
        </p>
      </div>

      <section className="panel-parchment p-6">
        <h2 className="font-display text-dnd-brown font-bold text-lg border-b-2 border-dnd-red pb-2 mb-4">
          What is this?
        </h2>
        <p className="text-dnd-brown text-sm leading-relaxed mb-3">
          The <strong>5e Encounter Assistant</strong> is a web application designed to help Dungeon Masters
          quickly build and manage combat encounters for Dungeons &amp; Dragons 5th Edition.
        </p>
        <p className="text-dnd-brown text-sm leading-relaxed">
          Browse the bestiary, add monsters to your encounter, preview their stat blocks, and
          then run the encounter with built-in HP tracking and difficulty estimation.
        </p>
      </section>

      <section className="panel-parchment p-6">
        <h2 className="font-display text-dnd-brown font-bold text-lg border-b-2 border-dnd-red pb-2 mb-4">
          Features
        </h2>
        <ul className="text-dnd-brown text-sm leading-relaxed space-y-2">
          {[
            "Browse hundreds of monsters from the Monster Manual and other official sourcebooks",
            "Search and filter the bestiary by name",
            "Preview full monster stat blocks including ability scores, AC, HP, and speed",
            "Build your encounter by adding multiple monsters",
            "Encounter difficulty estimation based on party level",
            "In-encounter HP tracking per monster",
            "Import additional sourcebooks or custom homebrew JSON files",
          ].map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-dnd-red font-bold mt-0.5">✦</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-parchment p-6">
        <h2 className="font-display text-dnd-brown font-bold text-lg border-b-2 border-dnd-red pb-2 mb-4">
          Data Sources
        </h2>
        <p className="text-dnd-brown text-sm leading-relaxed mb-3">
          Monster data is sourced from{" "}
          <strong>5etools</strong> (community-maintained D&amp;D 5e reference data).
          D&amp;D 5e is a product of Wizards of the Coast.
        </p>
        <p className="text-dnd-brown/60 text-xs italic">
          This tool is unofficial and not affiliated with Wizards of the Coast.
          Dungeons &amp; Dragons and D&amp;D are trademarks of Wizards of the Coast LLC.
        </p>
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
