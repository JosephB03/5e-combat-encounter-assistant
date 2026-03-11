import React, { useState, useEffect } from "react";

// XP cost by creature level delta relative to party level
const XP_BY_DELTA = { "-4": 10, "-3": 15, "-2": 20, "-1": 30, "0": 40, "1": 60, "2": 80, "3": 120, "4": 160 };

function getXPCost(creatureLevel, partyLevel) {
  const delta = creatureLevel - partyLevel;
  const clamped = Math.max(-4, Math.min(4, delta));
  return XP_BY_DELTA[String(clamped)] ?? (delta > 4 ? 160 : 10);
}

function PF2eCurrentEncounter({ encounter = [], setEncounter, partyLevel = 5 }) {
  const [repeats, setRepeats] = useState({});

  const generateKey = (c) => `${c.name}_${c.source}`;

  useEffect(() => {
    const newRepeats = {};
    for (const c of encounter) {
      const key = generateKey(c);
      if (key in newRepeats) newRepeats[key].count++;
      else newRepeats[key] = { count: 1, creature: c };
    }
    setRepeats(newRepeats);
  }, [encounter]);

  const handleRemove = (key) => {
    let removed = false;
    setEncounter((prev) =>
      prev.filter((item) => {
        const k = generateKey(item);
        if (!removed && k === key) { removed = true; return false; }
        return true;
      })
    );
  };

  const totalXP = Object.values(repeats).reduce(
    (sum, { count, creature }) => sum + getXPCost(creature.level, partyLevel) * count,
    0
  );

  return (
    <section className="panel-dnd p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0 border-0 pb-0">
          Encounter
          <span className="ml-2 text-dnd-text/40 font-body font-normal normal-case tracking-normal text-xs">
            ({encounter.length} creatures · {totalXP} XP)
          </span>
        </h2>
        {encounter.length > 0 && (
          <button onClick={() => setEncounter([])} className="btn-dnd-ghost">Clear</button>
        )}
      </div>

      {Object.keys(repeats).length === 0 ? (
        <p className="text-dnd-text/40 italic text-sm text-center py-4">No creatures added yet.</p>
      ) : (
        <ul className="space-y-1">
          {Object.entries(repeats).map(([key, { count, creature }]) => {
            const xp = getXPCost(creature.level, partyLevel);
            return (
              <li key={key} className="flex items-center justify-between bg-black/20 rounded px-3 py-2 border border-dnd-gold/10">
                <div className="flex items-center gap-2 min-w-0">
                  {count > 1 && (
                    <span className="bg-dnd-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {count}
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="text-dnd-text text-sm font-semibold block truncate">{creature.name}</span>
                    <span className="text-dnd-text/40 text-xs">
                      Lv {creature.level} · {xp * count} XP
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(key)}
                  className="text-dnd-text/40 hover:text-dnd-red transition-colors text-xs px-2 py-1 rounded hover:bg-dnd-red/10 shrink-0"
                >✕</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default PF2eCurrentEncounter;
