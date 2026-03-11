import React, { useState } from "react";
import { Link } from "react-router-dom";
import PF2eMonsters from "../components/PF2eMonsters";
import PF2eCurrentEncounter from "../components/PF2eCurrentEncounter";
import PF2eMonsterDisplay from "../components/ui/PF2eMonsterDisplay";

function PF2eAssistant({ encounter, setEncounter, partyLevel, setPartyLevel }) {
  const [preview, setPreview] = useState(null);

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left sidebar */}
      <div className="flex flex-col gap-4 w-full xl:w-80 shrink-0">
        {/* Creature preview */}
        <section>
          <h2 className="section-title">Creature Preview</h2>
          <PF2eMonsterDisplay creature={preview} />
        </section>

        {/* Party level for XP cost display */}
        <section className="panel-dnd p-4">
          <h2 className="section-title">Party Level</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPartyLevel((v) => Math.max(1, v - 1))}
              className="btn-dnd-ghost w-8 h-8 flex items-center justify-center text-base"
            >−</button>
            <span className="text-dnd-gold font-display font-bold text-2xl w-6 text-center">
              {partyLevel}
            </span>
            <button
              onClick={() => setPartyLevel((v) => Math.min(20, v + 1))}
              className="btn-dnd-ghost w-8 h-8 flex items-center justify-center text-base"
            >+</button>
          </div>
          <p className="text-dnd-text/40 text-xs mt-2">
            Used to calculate encounter XP costs
          </p>
        </section>

        <PF2eCurrentEncounter
          encounter={encounter}
          setEncounter={setEncounter}
          partyLevel={partyLevel}
        />

        <div>
          {encounter.length > 0 ? (
            <Link
              to="/pf2e-encounter"
              className="btn-dnd-primary block text-center w-full no-underline"
            >
              ⚔ Run Encounter
            </Link>
          ) : (
            <button disabled className="btn-dnd-primary w-full opacity-30 cursor-not-allowed">
              ⚔ Run Encounter
            </button>
          )}
        </div>
      </div>

      {/* Right: bestiary */}
      <div className="flex-1 min-w-0">
        <h2 className="section-title">Build Your Encounter</h2>
        <PF2eMonsters setEncounter={setEncounter} onPreview={setPreview} />
      </div>
    </div>
  );
}

export default PF2eAssistant;
