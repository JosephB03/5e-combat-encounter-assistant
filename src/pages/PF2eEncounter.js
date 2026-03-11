import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ─── PF2e XP / Difficulty ────────────────────────────────────────────────────

const XP_BY_DELTA = {
  "-4": 10, "-3": 15, "-2": 20, "-1": 30,
  "0": 40, "1": 60, "2": 80, "3": 120, "4": 160,
};

// Difficulty thresholds for a party of 4 (DMG equivalent)
const THRESHOLDS_4P = { low: 40, moderate: 60, severe: 80, extreme: 120 };

function getXPCost(creatureLevel, partyLevel) {
  const delta = Math.max(-4, Math.min(4, creatureLevel - partyLevel));
  return XP_BY_DELTA[String(delta)] ?? (creatureLevel - partyLevel > 4 ? 160 : 10);
}

// Scale thresholds by party size: each extra player adds 20 XP to budget
function getThresholds(playerCount) {
  const scale = playerCount / 4;
  return {
    low:      Math.round(THRESHOLDS_4P.low      * scale),
    moderate: Math.round(THRESHOLDS_4P.moderate * scale),
    severe:   Math.round(THRESHOLDS_4P.severe   * scale),
    extreme:  Math.round(THRESHOLDS_4P.extreme  * scale),
  };
}

function getDifficulty(totalXP, thresholds) {
  if (totalXP >= thresholds.extreme)  return { label: "Extreme",  color: "text-red-400",    border: "border-red-500/40",    note: "Potentially lethal" };
  if (totalXP >= thresholds.severe)   return { label: "Severe",   color: "text-orange-400", border: "border-orange-500/40", note: "Significant threat" };
  if (totalXP >= thresholds.moderate) return { label: "Moderate", color: "text-yellow-400", border: "border-yellow-500/40", note: "Balanced challenge" };
  if (totalXP >= thresholds.low)      return { label: "Low",      color: "text-green-400",  border: "border-green-500/40",  note: "Minor threat" };
  return { label: "Trivial", color: "text-dnd-text/50", border: "border-dnd-gold/20", note: "Little challenge" };
}

// ─── Action icons ─────────────────────────────────────────────────────────────

const ACTION_ICONS = { 1: "◆", 2: "◆◆", 3: "◆◆◆", reaction: "↺", free: "◇" };

function actionIcon(cost) {
  return ACTION_ICONS[cost] || (cost ? String(cost) : "");
}

// ─── Elite / Weak variant helpers ─────────────────────────────────────────────

function hpAdjust(baseLevel, isElite) {
  const abs = baseLevel <= 1 ? 10 : baseLevel <= 4 ? 15 : baseLevel <= 19 ? 20 : 30;
  return isElite ? abs : -abs;
}

function applyVariant(creature, variant) {
  if (!variant || variant === "normal") return creature;
  const elite = variant === "elite";
  const mod = elite ? 2 : -2;
  return {
    ...creature,
    _variant: variant,
    level: creature.level + (elite ? 1 : -1),
    ac: (creature.ac || 0) + mod,
    perception: (creature.perception || 0) + mod,
    hp: Math.max(1, (creature.hp || 0) + hpAdjust(creature.level, elite)),
    saves: {
      fort: (creature.saves?.fort || 0) + mod,
      ref:  (creature.saves?.ref  || 0) + mod,
      will: (creature.saves?.will || 0) + mod,
    },
    skills: Object.fromEntries(
      Object.entries(creature.skills || {}).map(([k, v]) => [k, v + mod])
    ),
    actions: (creature.actions || []).map((a) =>
      a.attack !== undefined ? { ...a, attack: a.attack + mod } : a
    ),
  };
}

const VARIANT_BADGE = {
  elite: { label: "Elite",  cls: "bg-amber-700 text-white" },
  weak:  { label: "Weak",   cls: "bg-blue-900  text-blue-200" },
};

// ─── Main component ───────────────────────────────────────────────────────────

function PF2eEncounter({ encounter = [], defaultPartyLevel = 5, variants = {} }) {
  const [partyCount, setPartyCount]   = useState(4);
  const [partyLevel, setPartyLevel]   = useState(defaultPartyLevel);
  const [playerView, setPlayerView]   = useState(false);

  // Deduplicate and apply variants
  const counts = {};
  for (const c of encounter) {
    const key = `${c.name}_${c.source}`;
    if (counts[key]) counts[key].count++;
    else {
      const variant = variants[key] || "normal";
      counts[key] = { count: 1, creature: applyVariant(c, variant), baseKey: key };
    }
  }

  // HP state: { [key]: number[] }
  const [hpState, setHpState] = useState({});
  useEffect(() => {
    setHpState((prev) => {
      const next = { ...prev };
      for (const [key, { count, creature }] of Object.entries(counts)) {
        if (!next[key] || next[key].length !== count) {
          next[key] = Array.from({ length: count }, () => creature.hp || 0);
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter.length]);

  const setInstanceHp = (key, i, val) =>
    setHpState((prev) => ({
      ...prev,
      [key]: prev[key].map((v, idx) => (idx === i ? Math.max(0, val) : v)),
    }));

  const resetHp = (key, maxHp) =>
    setHpState((prev) => ({ ...prev, [key]: prev[key].map(() => maxHp) }));

  // Reveal state: { [key]: Set<featureKey> }
  const [revealed, setRevealed] = useState({});
  const toggleReveal = (ck, fk) =>
    setRevealed((prev) => {
      const cur = new Set(prev[ck] || []);
      cur.has(fk) ? cur.delete(fk) : cur.add(fk);
      return { ...prev, [ck]: cur };
    });
  const isRevealed = (ck, fk) => !!(revealed[ck]?.has(fk));

  const totalXP = Object.values(counts).reduce(
    (sum, { count, creature }) => sum + getXPCost(creature.level, partyLevel) * count,
    0
  );
  const thresholds = getThresholds(partyCount);
  const difficulty = getDifficulty(totalXP, thresholds);

  if (encounter.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-6xl opacity-20">⚔</div>
        <h1 className="page-title">No Encounter Prepared</h1>
        <p className="text-dnd-text/50 max-w-md">
          Go back to the Builder and add creatures to your encounter.
        </p>
        <Link to="/pf2e" className="btn-dnd-primary no-underline mt-2">← Back to Builder</Link>
      </div>
    );
  }

  // ── Player View ─────────────────────────────────────────────────────────────
  if (playerView) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-display text-dnd-gold font-bold text-xl">Player View</span>
            <span className="text-dnd-text/40 text-sm">— Pathfinder 2e</span>
          </div>
          <button onClick={() => setPlayerView(false)} className="btn-dnd-secondary text-sm">
            ⚙ GM View
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(counts).map(([key, { count, creature }]) => (
            <PF2ePlayerCard
              key={key}
              creature={creature}
              count={count}
              hpValues={hpState[key] || []}
              revealedFeatures={revealed[key] || new Set()}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── GM View ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h1 className="page-title">PF2e Encounter</h1>
        <div className="flex gap-2">
          <button onClick={() => setPlayerView(true)} className="btn-dnd-primary text-sm">
            👁 Player View
          </button>
          <Link to="/pf2e" className="btn-dnd-secondary no-underline text-sm">← Edit</Link>
        </div>
      </div>

      {/* Party + Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="panel-dnd p-4">
          <h2 className="section-title">Party</h2>
          <div className="grid grid-cols-2 gap-6">
            <SpinnerInput label="Players" value={partyCount} min={1} max={12} onChange={setPartyCount} />
            <SpinnerInput label="Party Level" value={partyLevel} min={1} max={20} onChange={setPartyLevel} />
          </div>
          <p className="text-dnd-text/30 text-xs mt-3">
            XP budget scales with party size · creature cost based on level delta
          </p>
        </section>

        <section className={`panel-dnd p-4 border ${difficulty.border}`}>
          <h2 className="section-title">Encounter Difficulty</h2>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`font-display font-bold text-3xl ${difficulty.color}`}>
              {difficulty.label}
            </span>
            <span className="text-dnd-text/50 text-sm">{totalXP} XP</span>
          </div>
          <p className={`text-sm mb-3 ${difficulty.color} opacity-80`}>{difficulty.note}</p>

          {/* Threshold display */}
          <div className="space-y-1">
            {[
              { key: "low",      label: "Low" },
              { key: "moderate", label: "Moderate" },
              { key: "severe",   label: "Severe" },
              { key: "extreme",  label: "Extreme" },
            ].map(({ key, label }) => {
              const t = thresholds[key];
              const active = difficulty.label.toLowerCase() === key ||
                (key === "extreme" && totalXP >= thresholds.extreme);
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={`w-16 text-right font-semibold ${active ? "text-dnd-text" : "text-dnd-text/30"}`}>
                    {label}
                  </span>
                  <span className={`w-12 text-right ${active ? "text-dnd-gold" : "text-dnd-text/30"}`}>
                    {t}+
                  </span>
                  {active && <span className={`font-bold text-xs ${difficulty.color}`}>← {totalXP} XP</span>}
                </div>
              );
            })}
          </div>

          {/* XP breakdown */}
          <div className="mt-3 pt-2 border-t border-dnd-gold/10 text-xs text-dnd-text/30 space-y-0.5">
            {Object.values(counts).map(({ count, creature }) => {
              const xp = getXPCost(creature.level, partyLevel);
              const delta = creature.level - partyLevel;
              return (
                <p key={creature.name}>
                  {creature.name} (Lv {creature.level}, {delta >= 0 ? "+" : ""}{delta}) ×{count} = {xp * count} XP
                </p>
              );
            })}
          </div>
        </section>
      </div>

      {/* Creature cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(counts).map(([key, { count, creature }]) => (
          <PF2eCreatureCard
            key={key}
            creatureKey={key}
            creature={creature}
            count={count}
            partyLevel={partyLevel}
            hpValues={hpState[key] || Array.from({ length: count }, () => creature.hp || 0)}
            setInstanceHp={(i, val) => setInstanceHp(key, i, val)}
            resetHp={() => resetHp(key, creature.hp || 0)}
            isRevealed={(fk) => isRevealed(key, fk)}
            toggleReveal={(fk) => toggleReveal(key, fk)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SpinnerInput ─────────────────────────────────────────────────────────────

function SpinnerInput({ label, value, min, max, onChange }) {
  return (
    <div>
      <label className="block text-dnd-text/60 text-xs uppercase font-semibold tracking-wider mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange((v) => Math.max(min, v - 1))}
          className="btn-dnd-ghost w-8 h-8 flex items-center justify-center text-base"
        >−</button>
        <span className="text-dnd-gold font-display font-bold text-xl w-6 text-center">{value}</span>
        <button
          onClick={() => onChange((v) => Math.min(max, v + 1))}
          className="btn-dnd-ghost w-8 h-8 flex items-center justify-center text-base"
        >+</button>
      </div>
    </div>
  );
}

// ─── PF2eCreatureCard (GM) ────────────────────────────────────────────────────

function PF2eCreatureCard({ creatureKey, creature, count, partyLevel, hpValues, setInstanceHp, resetHp, isRevealed, toggleReveal }) {
  const [expanded, setExpanded] = useState(false);

  const maxHp  = creature.hp || 0;
  const xpCost = getXPCost(creature.level, partyLevel);
  const delta  = creature.level - partyLevel;
  const allDead = hpValues.every((v) => v === 0);

  const resistances   = creature.resistances   || [];
  const weaknesses    = creature.weaknesses    || [];
  const immunities    = creature.immunities    || [];
  const actions       = creature.actions       || [];
  const abilities     = creature.abilities     || [];

  const hasFeatures = resistances.length || weaknesses.length || immunities.length ||
    actions.length || abilities.length;

  return (
    <div className={`panel-dnd overflow-hidden flex flex-col transition-opacity duration-300 ${allDead ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="bg-dnd-red/20 border-b border-dnd-red/30 px-4 py-3 flex justify-between items-start">
        <div>
          <h3 className="font-display text-dnd-gold font-semibold text-base leading-tight">{creature.name}</h3>
          <p className="text-dnd-text/50 text-xs capitalize">
            {creature.size} {(creature.traits || []).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allDead && <span className="text-dnd-text/30 text-xs">Defeated</span>}
          {creature._variant && VARIANT_BADGE[creature._variant] && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${VARIANT_BADGE[creature._variant].cls}`}>
              {VARIANT_BADGE[creature._variant].label}
            </span>
          )}
          {count > 1 && (
            <span className="bg-dnd-red text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              ×{count}
            </span>
          )}
        </div>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-5 border-b border-dnd-gold/10">
        {[
          { l: "AC",   v: creature.ac },
          { l: "HP",   v: maxHp },
          { l: "Fort", v: fmtSave(creature.saves?.fort) },
          { l: "Ref",  v: fmtSave(creature.saves?.ref) },
          { l: "Will", v: fmtSave(creature.saves?.will) },
        ].map(({ l, v }) => (
          <div key={l} className="text-center py-2 border-r border-dnd-gold/10 last:border-r-0">
            <p className="text-dnd-text/40 text-xs uppercase font-semibold leading-none mb-0.5">{l}</p>
            <p className="text-dnd-gold font-bold text-sm">{v}</p>
          </div>
        ))}
      </div>

      {/* Level / XP info */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dnd-gold/10 text-xs text-dnd-text/50">
        <span>Level {creature.level}</span>
        <span>·</span>
        <span>Party {delta >= 0 ? "+" : ""}{delta}</span>
        <span>·</span>
        <span className="text-dnd-gold">{xpCost} XP each</span>
      </div>

      {/* HP trackers */}
      <div className="p-3 space-y-2.5">
        {hpValues.map((hp, i) => {
          const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
          const barColor = pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-dnd-red";
          return (
            <div key={i}>
              {count > 1 && (
                <p className="text-dnd-text/40 text-xs font-semibold mb-1">{creature.name} {i + 1}</p>
              )}
              {maxHp > 0 && (
                <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full ${barColor} transition-all duration-300 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              )}
              <div className="flex gap-1 items-center">
                <span className="text-dnd-text/50 text-xs w-12">{hp}/{maxHp}</span>
                {[1, 5, 10].map((d) => (
                  <button key={d} onClick={() => setInstanceHp(i, hp - d)} disabled={hp === 0}
                    className="btn-dnd-ghost text-xs px-1.5 py-0.5 disabled:opacity-25">−{d}</button>
                ))}
                <button onClick={() => setInstanceHp(i, hp + 1)}
                  className="btn-dnd-secondary text-xs px-1.5 py-0.5 ml-auto">+1</button>
                <button onClick={() => setInstanceHp(i, maxHp)}
                  className="btn-dnd-secondary text-xs px-1.5 py-0.5">↺</button>
              </div>
            </div>
          );
        })}
        {count > 1 && (
          <button onClick={resetHp} className="btn-dnd-secondary text-xs w-full">Reset All HP</button>
        )}
      </div>

      {hasFeatures && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between px-4 py-2 border-t border-dnd-gold/20 text-dnd-text/50 hover:text-dnd-gold hover:bg-dnd-gold/5 transition-colors text-xs font-display uppercase tracking-wider"
        >
          <span>Features &amp; Defenses</span>
          <span>{expanded ? "▲" : "▼"}</span>
        </button>
      )}

      {expanded && hasFeatures && (
        <PF2eFeaturePanel
          resistances={resistances}
          weaknesses={weaknesses}
          immunities={immunities}
          actions={actions}
          abilities={abilities}
          isRevealed={isRevealed}
          toggleReveal={toggleReveal}
        />
      )}
    </div>
  );
}

function fmtSave(v) {
  if (v === undefined || v === null) return "—";
  return v >= 0 ? `+${v}` : `${v}`;
}

// ─── PF2eFeaturePanel (GM toggle panel) ──────────────────────────────────────

function PF2eFeaturePanel({ resistances, weaknesses, immunities, actions, abilities, isRevealed, toggleReveal }) {
  return (
    <div className="border-t border-dnd-gold/20 bg-black/10 p-3 space-y-4">
      <p className="text-dnd-text/30 text-xs italic text-center">
        Click to toggle player visibility
      </p>

      {weaknesses.length > 0 && (
        <DefenseGroup
          title="Weaknesses" titleClass="text-red-400"
          items={weaknesses.map((w, i) => ({
            key: `weakness_${i}`,
            label: `${w.type}${w.value ? ` ${w.value}` : ""}${w.note ? ` (${w.note})` : ""}`,
            badge: w.value ? `×${w.value}` : null,
            badgeClass: "bg-red-900/60 text-red-300",
          }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}

      {resistances.length > 0 && (
        <DefenseGroup
          title="Resistances" titleClass="text-blue-400"
          items={resistances.map((r, i) => ({
            key: `resistance_${i}`,
            label: `${r.type} ${r.value}${r.note ? ` (${r.note})` : ""}`,
            badge: r.value ? `-${r.value}` : null,
            badgeClass: "bg-blue-900/60 text-blue-300",
          }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}

      {immunities.length > 0 && (
        <DefenseGroup
          title="Immunities" titleClass="text-purple-400"
          items={immunities.map((imm, i) => ({
            key: `immunity_${i}`,
            label: typeof imm === "string" ? imm : `${imm}`,
            badge: "0",
            badgeClass: "bg-purple-900/60 text-purple-300",
          }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}

      {actions.length > 0 && (
        <NamedFeatureGroup
          title="Actions" features={actions} prefix="action"
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}

      {abilities.length > 0 && (
        <NamedFeatureGroup
          title="Special Abilities" features={abilities} prefix="ability"
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
    </div>
  );
}

function DefenseGroup({ title, titleClass, items, isRevealed, toggleReveal }) {
  return (
    <div>
      <p className={`text-xs font-display uppercase font-semibold tracking-wider mb-1.5 ${titleClass}`}>{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ key, label, badge, badgeClass }) => {
          const rev = isRevealed(key);
          return (
            <button
              key={key}
              onClick={() => toggleReveal(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all duration-150 ${
                rev
                  ? "bg-dnd-gold/20 border-dnd-gold text-dnd-gold shadow-sm"
                  : "bg-black/20 border-dnd-text/20 text-dnd-text/40 hover:border-dnd-text/50 hover:text-dnd-text/70"
              }`}
            >
              {badge && (
                <span className={`text-xs font-bold px-0.5 rounded ${rev ? "text-dnd-gold" : badgeClass}`}>{badge}</span>
              )}
              <span>{label}</span>
              <span className="opacity-60 ml-0.5">{rev ? "👁" : "🔒"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NamedFeatureGroup({ title, features, prefix, isRevealed, toggleReveal }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <p className="text-xs font-display uppercase font-semibold tracking-wider mb-1.5 text-dnd-text/60">{title}</p>
      <div className="space-y-1">
        {features.map((feat) => {
          const key = `${prefix}_${feat.name}`;
          const rev = isRevealed(key);
          const isOpen = open === feat.name;
          const desc = feat.description || (feat.type === "Strike"
            ? `${fmtSave(feat.attack)} to hit · ${feat.damage} ${feat.damageType || ""}${feat.range ? ` · ${feat.range}` : ""}${feat.note ? ` · ${feat.note}` : ""}`
            : "");
          return (
            <div key={key} className={`rounded border transition-all overflow-hidden ${rev ? "border-dnd-gold/50 bg-dnd-gold/10" : "border-dnd-text/10 bg-black/20"}`}>
              <div className="flex items-center justify-between px-2 py-1.5 gap-2">
                <button onClick={() => setOpen(isOpen ? null : feat.name)} className="flex-1 text-left flex items-center gap-1.5">
                  <span className="text-dnd-red font-mono text-xs">{actionIcon(feat.cost)}</span>
                  <span className={`text-xs font-semibold ${rev ? "text-dnd-gold" : "text-dnd-text/60"}`}>{feat.name}</span>
                  {feat.traits?.length > 0 && (
                    <span className="text-dnd-text/30 text-xs italic">({feat.traits.join(", ")})</span>
                  )}
                </button>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setOpen(isOpen ? null : feat.name)}
                    className="text-dnd-text/30 hover:text-dnd-text/60 text-xs px-1">{isOpen ? "▲" : "▼"}</button>
                  <button
                    onClick={() => toggleReveal(key)}
                    className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                      rev
                        ? "border-dnd-gold text-dnd-gold hover:bg-dnd-gold/20"
                        : "border-dnd-text/20 text-dnd-text/30 hover:border-dnd-text/50 hover:text-dnd-text/60"
                    }`}
                  >{rev ? "👁 Shown" : "🔒 Hidden"}</button>
                </div>
              </div>
              {isOpen && desc && (
                <div className="px-3 pb-2 border-t border-dnd-gold/10">
                  <p className="text-xs text-dnd-text/70 leading-relaxed pt-1.5">{desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PF2ePlayerCard (player-facing) ──────────────────────────────────────────

function PF2ePlayerCard({ creature, count, hpValues, revealedFeatures }) {
  const maxHp = creature.hp || 0;
  const allDead = hpValues.length > 0 && hpValues.every((v) => v === 0);

  const revWeaknesses  = (creature.weaknesses  || []).filter((_, i) => revealedFeatures.has(`weakness_${i}`));
  const revResistances = (creature.resistances || []).filter((_, i) => revealedFeatures.has(`resistance_${i}`));
  const revImmunities  = (creature.immunities  || []).filter((_, i) => revealedFeatures.has(`immunity_${i}`));
  const revActions     = (creature.actions     || []).filter((f) => revealedFeatures.has(`action_${f.name}`));
  const revAbilities   = (creature.abilities   || []).filter((f) => revealedFeatures.has(`ability_${f.name}`));

  const hasAny = revWeaknesses.length || revResistances.length || revImmunities.length ||
    revActions.length || revAbilities.length;

  return (
    <div className={`panel-parchment overflow-hidden flex flex-col ${allDead ? "opacity-40 grayscale" : ""}`}>
      {/* Header banner */}
      <div className="bg-dnd-red/80 px-4 py-3 border-b-2 border-dnd-red">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-white font-bold text-xl leading-tight">{creature.name}</h3>
              {creature._variant && VARIANT_BADGE[creature._variant] && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${VARIANT_BADGE[creature._variant].cls}`}>
                  {VARIANT_BADGE[creature._variant].label}
                </span>
              )}
            </div>
            <p className="text-white/70 text-xs capitalize">
              Level {creature.level} {creature.size} {(creature.traits || []).join(", ")}
            </p>
          </div>
          {count > 1 && (
            <span className="bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5 shrink-0">×{count}</span>
          )}
        </div>
      </div>

      {/* HP condition bars */}
      <div className="px-4 py-3 space-y-2 border-b border-dnd-parchment-dark">
        {hpValues.map((hp, i) => {
          const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
          const { label: cond, bar } = hpConditionPF2e(pct, hp === 0);
          return (
            <div key={i}>
              {count > 1 && <p className="text-dnd-brown/50 text-xs mb-0.5">{creature.name} {i + 1}</p>}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-dnd-parchment-dark rounded-full overflow-hidden border border-dnd-brown/20">
                  <div className={`h-full ${bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-dnd-brown text-xs font-semibold w-20 shrink-0">{cond}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revealed defenses */}
      {hasAny ? (
        <div className="px-4 py-3 space-y-3 flex-1">
          {revWeaknesses.length > 0 && (
            <PlayerDefenseChips
              title="Weaknesses" titleClass="text-red-700"
              items={revWeaknesses.map((w) => ({
                label: `${w.type}${w.value ? ` ${w.value}` : ""}`,
                chipClass: "bg-red-100 text-red-800 border-red-300",
                badge: w.value ? `×${w.value}` : null,
              }))}
            />
          )}
          {revResistances.length > 0 && (
            <PlayerDefenseChips
              title="Resistances" titleClass="text-blue-700"
              items={revResistances.map((r) => ({
                label: `${r.type} ${r.value}`,
                chipClass: "bg-blue-100 text-blue-800 border-blue-300",
                badge: `-${r.value}`,
              }))}
            />
          )}
          {revImmunities.length > 0 && (
            <PlayerDefenseChips
              title="Immunities" titleClass="text-purple-700"
              items={revImmunities.map((imm) => ({
                label: typeof imm === "string" ? imm : String(imm),
                chipClass: "bg-purple-100 text-purple-800 border-purple-300",
                badge: "0",
              }))}
            />
          )}
          {[
            { items: revActions,   title: "Actions" },
            { items: revAbilities, title: "Special Abilities" },
          ].filter(({ items }) => items.length > 0).map(({ items, title }) => (
            <div key={title}>
              <p className="text-dnd-brown/60 text-xs font-display uppercase font-semibold tracking-wider mb-1">{title}</p>
              <div className="space-y-1.5">
                {items.map((f) => (
                  <div key={f.name} className="bg-dnd-parchment-dark rounded p-2 border border-dnd-gold-dark/20">
                    <div className="flex items-center gap-1 mb-0.5">
                      {f.cost !== undefined && (
                        <span className="text-dnd-red font-mono text-xs">{actionIcon(f.cost)}</span>
                      )}
                      <p className="text-dnd-brown font-semibold text-xs">{f.name}</p>
                      {f.traits?.length > 0 && (
                        <span className="text-dnd-brown/50 text-xs italic">({f.traits.join(", ")})</span>
                      )}
                    </div>
                    {f.type === "Strike" ? (
                      <p className="text-dnd-brown/80 text-xs">
                        {fmtSave(f.attack)} to hit · {f.damage} {f.damageType || ""}
                        {f.range ? ` · ${f.range}` : ""}
                        {f.note ? ` · ${f.note}` : ""}
                      </p>
                    ) : f.description ? (
                      <p className="text-dnd-brown/80 text-xs leading-relaxed">{f.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 text-center text-dnd-brown/30 text-xs italic flex-1">
          No features revealed yet
        </div>
      )}
    </div>
  );
}

function hpConditionPF2e(pct, isDead) {
  if (isDead)    return { label: "Defeated",    bar: "bg-gray-400" };
  if (pct >= 75) return { label: "Healthy",     bar: "bg-green-500" };
  if (pct >= 50) return { label: "Wounded",     bar: "bg-yellow-500" };
  if (pct >= 25) return { label: "Bloodied",    bar: "bg-orange-500" };
  return           { label: "Near Death",  bar: "bg-red-600" };
}

function PlayerDefenseChips({ title, titleClass, items }) {
  return (
    <div>
      <p className={`text-xs font-display uppercase font-semibold tracking-wider mb-1.5 ${titleClass}`}>{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ label, chipClass, badge }, i) => (
          <span key={i} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${chipClass}`}>
            {badge && <span className="font-bold">{badge}</span>}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PF2eEncounter;
