import React, { useState, useEffect } from "react";

// XP cost by creature level delta relative to party level
const XP_BY_DELTA = { "-4": 10, "-3": 15, "-2": 20, "-1": 30, "0": 40, "1": 60, "2": 80, "3": 120, "4": 160 };

function getXPCost(creatureLevel, partyLevel) {
  const delta = creatureLevel - partyLevel;
  const clamped = Math.max(-4, Math.min(4, delta));
  return XP_BY_DELTA[String(clamped)] ?? (delta > 4 ? 160 : 10);
}

function variantLevel(baseLevel, variant) {
  if (variant === "elite") return baseLevel + 1;
  if (variant === "weak")  return baseLevel - 1;
  return baseLevel;
}

const VARIANT_STYLES = {
  elite:  { label: "E", title: "Elite",  btn: "bg-amber-700 text-white border-amber-600" },
  normal: { label: "N", title: "Normal", btn: "bg-dnd-panel text-dnd-text/60 border-dnd-gold/20" },
  weak:   { label: "W", title: "Weak",   btn: "bg-blue-900 text-blue-200 border-blue-700" },
};

function PF2eCurrentEncounter({ encounter = [], setEncounter, partyLevel = 5, variants = {}, setVariants = () => {} }) {
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

  const setVariant = (key, variant) => {
    setVariants((prev) => ({ ...prev, [key]: variant }));
  };

  const totalXP = Object.entries(repeats).reduce(
    (sum, [key, { count, creature }]) => {
      const v = variants[key] || "normal";
      const lvl = variantLevel(creature.level, v);
      return sum + getXPCost(lvl, partyLevel) * count;
    },
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
        <ul className="space-y-2">
          {Object.entries(repeats).map(([key, { count, creature }]) => {
            const variant = variants[key] || "normal";
            const lvl = variantLevel(creature.level, variant);
            const xp = getXPCost(lvl, partyLevel);
            return (
              <li key={key} className="bg-black/20 rounded border border-dnd-gold/10 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {count > 1 && (
                      <span className="bg-dnd-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {count}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="text-dnd-text text-sm font-semibold block truncate">{creature.name}</span>
                      <span className="text-dnd-text/40 text-xs">
                        Lv {lvl} · {xp * count} XP
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(key)}
                    className="text-dnd-text/40 hover:text-dnd-red transition-colors text-xs px-2 py-1 rounded hover:bg-dnd-red/10 shrink-0"
                  >✕</button>
                </div>

                {/* Variant toggle */}
                <div className="flex border-t border-dnd-gold/10">
                  {["elite", "normal", "weak"].map((v) => {
                    const s = VARIANT_STYLES[v];
                    const active = variant === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setVariant(key, v)}
                        title={s.title}
                        className={`flex-1 text-xs py-1 font-display font-semibold border-r border-dnd-gold/10 last:border-r-0 transition-colors ${
                          active ? s.btn : "text-dnd-text/30 hover:text-dnd-text/60 hover:bg-white/5"
                        }`}
                      >
                        {s.title}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default PF2eCurrentEncounter;
