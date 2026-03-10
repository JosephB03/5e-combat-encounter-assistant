import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { storage } from "../components/other/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

// ─── XP / Difficulty tables ───────────────────────────────────────────────────

const CR_XP = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
  "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "30": 155000,
};

const XP_THRESHOLDS_PER_PLAYER = {
  easy:   [25,  50,  75,  125, 250,  300,  350,  450,  550,  600,  800,  1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
  medium: [50,  100, 150, 250, 500,  600,  750,  900,  1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
  hard:   [75,  150, 225, 375, 750,  900,  1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
  deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700],
};

const MULTIPLIER_STEPS = [1, 1.5, 2, 2.5, 3, 4];

function getXPMultiplier(monsterCount, playerCount) {
  let step;
  if (monsterCount === 1)      step = 0;
  else if (monsterCount === 2) step = 1;
  else if (monsterCount <= 6)  step = 2;
  else if (monsterCount <= 10) step = 3;
  else if (monsterCount <= 14) step = 4;
  else                         step = 5;
  if (playerCount < 3)  step = Math.min(step + 1, MULTIPLIER_STEPS.length - 1);
  if (playerCount >= 6) step = Math.max(step - 1, 0);
  return MULTIPLIER_STEPS[step];
}

function getThresholds(playerCount, playerLevel) {
  const lvl = Math.min(Math.max(playerLevel, 1), 20) - 1;
  return {
    easy:   XP_THRESHOLDS_PER_PLAYER.easy[lvl]   * playerCount,
    medium: XP_THRESHOLDS_PER_PLAYER.medium[lvl] * playerCount,
    hard:   XP_THRESHOLDS_PER_PLAYER.hard[lvl]   * playerCount,
    deadly: XP_THRESHOLDS_PER_PLAYER.deadly[lvl] * playerCount,
  };
}

function getDifficulty(adjustedXP, thresholds) {
  if (adjustedXP >= thresholds.deadly) return { label: "Deadly",  color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-900/20"    };
  if (adjustedXP >= thresholds.hard)   return { label: "Hard",    color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-900/20" };
  if (adjustedXP >= thresholds.medium) return { label: "Medium",  color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-900/20" };
  if (adjustedXP >= thresholds.easy)   return { label: "Easy",    color: "text-green-400",  border: "border-green-500/40",  bg: "bg-green-900/20"  };
  return { label: "Trivial", color: "text-dnd-text/50", border: "border-dnd-gold/20", bg: "bg-dnd-panel" };
}

function getRawXP(cr) {
  return CR_XP[typeof cr === "object" ? cr?.cr : cr] || 0;
}

function getCRString(cr) {
  if (!cr) return "—";
  return typeof cr === "object" ? cr.cr : cr;
}

// ─── 5etools text renderer ────────────────────────────────────────────────────

function render5e(text) {
  if (!text) return "";
  return text
    .replace(/\{@atk ([^}]+)\}/g, (_, t) =>
      t.split(",").map((p) =>
        p.trim() === "mw" ? "Melee" : p.trim() === "rw" ? "Ranged" :
        p.trim() === "ms" ? "Melee Spell" : p.trim() === "rs" ? "Ranged Spell" : p.trim()
      ).join("/") + " Weapon Attack:"
    )
    .replace(/\{@h\}/g, "Hit: ")
    .replace(/\{@hit ([+-]?\d+)\}/g, "+$1")
    .replace(/\{@damage ([^}]+)\}/g, "$1")
    .replace(/\{@dice ([^}]+)\}/g, "$1")
    .replace(/\{@dc (\d+)\}/g, "DC $1")
    .replace(/\{@condition ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@status ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@creature ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@spell ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@item ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@skill ([^|}\s]+)(?:\|[^}]*)?\}/g, "$1")
    .replace(/\{@[^}]+\}/g, "");
}

// ─── Damage list helpers ──────────────────────────────────────────────────────

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function expandDamageList(list) {
  if (!list) return [];
  return list.map((item, idx) => {
    if (typeof item === "string") return { key: `${idx}`, label: capitalize(item) };
    if (item.special)             return { key: `${idx}`, label: item.special };
    const types = item.resist || item.immune || item.vulnerable || [];
    return {
      key: `${idx}`,
      label: types.map(capitalize).join(", ") + (item.note ? ` (${item.note})` : ""),
    };
  });
}

// ─── Firebase image hook ──────────────────────────────────────────────────────

function useMonsterImage(monster) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!monster || monster.name === "None") { setUrl(""); return; }
    const r = ref(storage, `bestiary-imgs/${monster.source}/${monster.name}.webp`);
    getDownloadURL(r).then(setUrl).catch(() => setUrl(""));
  }, [monster]);
  return url;
}

// ─── Encounter component ──────────────────────────────────────────────────────

function Encounter({ encounter = [] }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerLevel, setPlayerLevel] = useState(5);
  const [playerView, setPlayerView] = useState(false);

  // Deduplicate monsters
  const counts = {};
  for (const m of encounter) {
    const key = `${m.name}_${m.source}`;
    if (counts[key]) counts[key].count++;
    else counts[key] = { count: 1, monster: m };
  }

  // HP state lifted up: { [monsterKey]: number[] }
  const [hpState, setHpState] = useState({});

  // Proper HP init from counts
  useEffect(() => {
    setHpState((prev) => {
      const next = { ...prev };
      for (const [key, { count, monster }] of Object.entries(counts)) {
        if (!next[key] || next[key].length !== count) {
          next[key] = Array.from({ length: count }, () => monster.hp?.average || 0);
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
    setHpState((prev) => ({
      ...prev,
      [key]: prev[key].map(() => maxHp),
    }));

  // Reveal state: { [monsterKey]: Set<featureKey> }
  const [revealed, setRevealed] = useState({});

  const toggleReveal = (monsterKey, featureKey) =>
    setRevealed((prev) => {
      const cur = new Set(prev[monsterKey] || []);
      cur.has(featureKey) ? cur.delete(featureKey) : cur.add(featureKey);
      return { ...prev, [monsterKey]: cur };
    });

  const isRevealed = (monsterKey, featureKey) =>
    !!(revealed[monsterKey]?.has(featureKey));

  const totalMonsters = encounter.length;
  const rawXP = Object.values(counts).reduce(
    (sum, { count, monster }) => sum + getRawXP(monster.cr) * count, 0
  );
  const multiplier   = getXPMultiplier(totalMonsters, playerCount);
  const adjustedXP   = Math.round(rawXP * multiplier);
  const thresholds   = getThresholds(playerCount, playerLevel);
  const difficulty   = getDifficulty(adjustedXP, thresholds);

  if (encounter.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="text-6xl opacity-20">⚔</div>
        <h1 className="page-title">No Encounter Prepared</h1>
        <p className="text-dnd-text/50 max-w-md">
          Go back to the Builder and add monsters to your encounter.
        </p>
        <Link to="/" className="btn-dnd-primary no-underline mt-2">← Back to Builder</Link>
      </div>
    );
  }

  // ── Player View ─────────────────────────────────────────────────────────────
  if (playerView) {
    return (
      <div className="flex flex-col gap-4">
        {/* Player view header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-display text-dnd-gold font-bold text-xl">Player View</span>
            <span className="text-dnd-text/40 text-sm">— visible to players</span>
          </div>
          <button
            onClick={() => setPlayerView(false)}
            className="btn-dnd-secondary text-sm"
          >
            ⚙ GM View
          </button>
        </div>

        {/* Player cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(counts).map(([key, { count, monster }]) => (
            <PlayerCard
              key={key}
              monster={monster}
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <h1 className="page-title">Combat Encounter</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPlayerView(true)}
            className="btn-dnd-primary text-sm"
          >
            👁 Player View
          </button>
          <Link to="/" className="btn-dnd-secondary no-underline text-sm">
            ← Edit
          </Link>
        </div>
      </div>

      {/* Party + Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Party settings */}
        <section className="panel-dnd p-4">
          <h2 className="section-title">Party</h2>
          <div className="grid grid-cols-2 gap-6">
            <SpinnerInput
              label="Players"
              value={playerCount}
              min={1} max={12}
              onChange={setPlayerCount}
              note={playerCount < 3 ? "Small party — harder" : playerCount >= 6 ? "Large party — easier" : null}
            />
            <SpinnerInput
              label="Level"
              value={playerLevel}
              min={1} max={20}
              onChange={setPlayerLevel}
            />
          </div>
        </section>

        {/* Difficulty */}
        <section className={`panel-dnd p-4 border ${difficulty.border}`}>
          <h2 className="section-title">Difficulty</h2>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`font-display font-bold text-3xl ${difficulty.color}`}>
              {difficulty.label}
            </span>
            <span className="text-dnd-text/50 text-sm">{adjustedXP.toLocaleString()} adj. XP</span>
          </div>
          <div className="space-y-1">
            {[
              { key: "easy",   label: "Easy" },
              { key: "medium", label: "Medium" },
              { key: "hard",   label: "Hard" },
              { key: "deadly", label: "Deadly" },
            ].map(({ key, label }) => {
              const thresh = thresholds[key];
              const active = difficulty.label.toLowerCase() === key ||
                (key === "deadly" && adjustedXP >= thresholds.deadly);
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className={`w-12 text-right font-semibold ${active ? "text-dnd-text" : "text-dnd-text/30"}`}>
                    {label}
                  </span>
                  <span className={`w-16 text-right ${active ? "text-dnd-gold" : "text-dnd-text/30"}`}>
                    {thresh.toLocaleString()}
                  </span>
                  {active && (
                    <span className={`text-xs font-bold ${difficulty.color}`}>← {adjustedXP.toLocaleString()}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-dnd-gold/10 text-xs text-dnd-text/30 space-y-0.5">
            <p>{totalMonsters} monster{totalMonsters !== 1 ? "s" : ""} · Raw {rawXP.toLocaleString()} XP · ×{multiplier} multiplier</p>
          </div>
        </section>
      </div>

      {/* Monster cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(counts).map(([key, { count, monster }]) => (
          <MonsterCard
            key={key}
            monsterKey={key}
            monster={monster}
            count={count}
            hpValues={hpState[key] || Array.from({ length: count }, () => monster.hp?.average || 0)}
            setInstanceHp={(i, val) => setInstanceHp(key, i, val)}
            resetHp={() => resetHp(key, monster.hp?.average || 0)}
            isRevealed={(fk) => isRevealed(key, fk)}
            toggleReveal={(fk) => toggleReveal(key, fk)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SpinnerInput ─────────────────────────────────────────────────────────────

function SpinnerInput({ label, value, min, max, onChange, note }) {
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
      {note && <p className="text-dnd-text/40 text-xs mt-1">{note}</p>}
    </div>
  );
}

// ─── MonsterCard (GM view) ────────────────────────────────────────────────────

function MonsterCard({ monsterKey, monster, count, hpValues, setInstanceHp, resetHp, isRevealed, toggleReveal }) {
  const [expanded, setExpanded] = useState(false);

  const maxHp = monster.hp?.average || 0;
  const cr    = getCRString(monster.cr);
  const xp    = getRawXP(monster.cr);
  const size  = Array.isArray(monster.size) ? monster.size[0] : monster.size;
  const SIZES = { T: "Tiny", S: "Small", M: "Medium", L: "Large", H: "Huge", G: "Gargantuan" };
  const type  = typeof monster.type === "object" ? monster.type.type : monster.type;
  const ac    = monster.ac
    ? typeof monster.ac[0] === "object" ? monster.ac[0].ac : monster.ac[0]
    : "—";

  const allDead = hpValues.every((v) => v === 0);

  const resistItems     = expandDamageList(monster.resist);
  const immuneItems     = expandDamageList(monster.immune);
  const vulnerableItems = expandDamageList(monster.vulnerable);
  const conditionItems  = (monster.conditionImmune || []).map((c, i) => ({ key: `${i}`, label: capitalize(c) }));
  const traits    = monster.trait     || [];
  const actions   = monster.action    || [];
  const reactions = monster.reaction  || [];
  const legendary = monster.legendary || [];
  const hasFeatures =
    resistItems.length || immuneItems.length || vulnerableItems.length ||
    conditionItems.length || traits.length || actions.length ||
    reactions.length || legendary.length;

  return (
    <div className={`panel-dnd overflow-hidden flex flex-col transition-opacity duration-300 ${allDead ? "opacity-50" : ""}`}>
      {/* Header */}
      <div className="bg-dnd-red/20 border-b border-dnd-red/30 px-4 py-3 flex justify-between items-start">
        <div>
          <h3 className="font-display text-dnd-gold font-semibold text-base leading-tight">{monster.name}</h3>
          <p className="text-dnd-text/50 text-xs capitalize">{SIZES[size] || size} {type}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allDead && <span className="text-dnd-text/30 text-xs font-display">Defeated</span>}
          {count > 1 && (
            <span className="bg-dnd-red text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">×{count}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 border-b border-dnd-gold/10">
        {[{ l: "AC", v: ac }, { l: "HP", v: maxHp || "—" }, { l: "CR", v: cr }, { l: "XP", v: xp ? xp.toLocaleString() : "—" }].map(({ l, v }) => (
          <div key={l} className="text-center py-2 border-r border-dnd-gold/10 last:border-r-0">
            <p className="text-dnd-text/40 text-xs uppercase font-semibold leading-none mb-0.5">{l}</p>
            <p className="text-dnd-gold font-bold text-sm">{v}</p>
          </div>
        ))}
      </div>

      {/* HP trackers */}
      <div className="p-3 space-y-2.5">
        {hpValues.map((hp, i) => {
          const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
          const barColor = pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-dnd-red";
          return (
            <div key={i}>
              {count > 1 && (
                <p className="text-dnd-text/40 text-xs font-semibold mb-1">{monster.name} {i + 1}</p>
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
                    className="btn-dnd-ghost text-xs px-1.5 py-0.5 disabled:opacity-25" title={`−${d} HP`}
                  >−{d}</button>
                ))}
                <button onClick={() => setInstanceHp(i, hp + 1)}
                  className="btn-dnd-secondary text-xs px-1.5 py-0.5 ml-auto" title="+1 HP">+1</button>
                <button onClick={() => setInstanceHp(i, maxHp)}
                  className="btn-dnd-secondary text-xs px-1.5 py-0.5" title="Reset HP">↺</button>
              </div>
            </div>
          );
        })}
        {count > 1 && (
          <button onClick={resetHp} className="btn-dnd-secondary text-xs w-full">Reset All HP</button>
        )}
      </div>

      {/* Features toggle */}
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
        <FeatureRevealPanel
          resistItems={resistItems} immuneItems={immuneItems}
          vulnerableItems={vulnerableItems} conditionItems={conditionItems}
          traits={traits} actions={actions} reactions={reactions} legendary={legendary}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
    </div>
  );
}

// ─── PlayerCard (player-facing view) ─────────────────────────────────────────

function PlayerCard({ monster, count, hpValues, revealedFeatures }) {
  const imgUrl = useMonsterImage(monster);

  const maxHp   = monster.hp?.average || 0;
  const size    = Array.isArray(monster.size) ? monster.size[0] : monster.size;
  const SIZES   = { T: "Tiny", S: "Small", M: "Medium", L: "Large", H: "Huge", G: "Gargantuan" };
  const type    = typeof monster.type === "object" ? monster.type.type : monster.type;

  // Build revealed feature lists
  const resistItems     = expandDamageList(monster.resist);
  const immuneItems     = expandDamageList(monster.immune);
  const vulnerableItems = expandDamageList(monster.vulnerable);
  const conditionItems  = (monster.conditionImmune || []).map((c, i) => ({ key: `${i}`, label: capitalize(c) }));
  const traits    = monster.trait     || [];
  const actions   = monster.action    || [];
  const reactions = monster.reaction  || [];
  const legendary = monster.legendary || [];

  const revVulnerable  = vulnerableItems.filter((i) => revealedFeatures.has(`vulnerable_${i.key}`));
  const revResist      = resistItems.filter((i) => revealedFeatures.has(`resist_${i.key}`));
  const revImmune      = immuneItems.filter((i) => revealedFeatures.has(`immune_${i.key}`));
  const revCondition   = conditionItems.filter((i) => revealedFeatures.has(`conditionImmune_${i.key}`));
  const revTraits      = traits.filter((f) => revealedFeatures.has(`trait_${f.name}`));
  const revActions     = actions.filter((f) => revealedFeatures.has(`action_${f.name}`));
  const revReactions   = reactions.filter((f) => revealedFeatures.has(`reaction_${f.name}`));
  const revLegendary   = legendary.filter((f) => revealedFeatures.has(`legendary_${f.name}`));

  const hasAnyRevealed =
    revVulnerable.length || revResist.length || revImmune.length ||
    revCondition.length || revTraits.length || revActions.length ||
    revReactions.length || revLegendary.length;

  const allDead = hpValues.length > 0 && hpValues.every((v) => v === 0);

  return (
    <div className={`panel-parchment overflow-hidden flex flex-col ${allDead ? "opacity-40 grayscale" : ""}`}>
      {/* Monster image */}
      {imgUrl ? (
        <div className="relative bg-dnd-brown/10 border-b-2 border-dnd-red/30 overflow-hidden h-48 flex items-center justify-center">
          <img
            src={imgUrl}
            alt={monster.name}
            className="max-h-full max-w-full object-contain"
          />
          {allDead && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-4xl">☠</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-28 bg-dnd-parchment-dark border-b-2 border-dnd-red/30 flex items-center justify-center">
          <span className="text-dnd-brown/30 text-5xl font-display">
            {allDead ? "☠" : "?"}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-dnd-red/20">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-dnd-brown font-bold text-xl leading-tight">{monster.name}</h3>
            <p className="text-dnd-brown/60 text-xs italic capitalize">
              {SIZES[size] || size} {type}
            </p>
          </div>
          {count > 1 && (
            <span className="bg-dnd-red text-white text-xs font-bold rounded-full px-2 py-0.5 mt-1 shrink-0">
              ×{count}
            </span>
          )}
        </div>
      </div>

      {/* HP bars — abstract condition, one per instance */}
      <div className="px-4 py-3 space-y-2 border-b border-dnd-parchment-dark">
        {hpValues.map((hp, i) => {
          const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
          const { label: cond, bar } = hpCondition(pct, hp === 0);
          return (
            <div key={i}>
              {count > 1 && (
                <p className="text-dnd-brown/50 text-xs mb-0.5">{monster.name} {i + 1}</p>
              )}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-dnd-parchment-dark rounded-full overflow-hidden border border-dnd-brown/20">
                  <div
                    className={`h-full ${bar} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-dnd-brown text-xs font-semibold w-20 shrink-0">{cond}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revealed features */}
      {hasAnyRevealed ? (
        <div className="px-4 py-3 space-y-3 flex-1">
          {revVulnerable.length > 0 && (
            <RevealedDefenseGroup
              title="Vulnerabilities" badge="2×"
              items={revVulnerable}
              chipClass="bg-red-100 text-red-800 border-red-300"
              titleClass="text-red-700"
            />
          )}
          {revResist.length > 0 && (
            <RevealedDefenseGroup
              title="Resistances" badge="½"
              items={revResist}
              chipClass="bg-blue-100 text-blue-800 border-blue-300"
              titleClass="text-blue-700"
            />
          )}
          {revImmune.length > 0 && (
            <RevealedDefenseGroup
              title="Immunities" badge="0"
              items={revImmune}
              chipClass="bg-purple-100 text-purple-800 border-purple-300"
              titleClass="text-purple-700"
            />
          )}
          {revCondition.length > 0 && (
            <RevealedDefenseGroup
              title="Condition Immunities"
              items={revCondition}
              chipClass="bg-purple-50 text-purple-700 border-purple-200"
              titleClass="text-purple-600"
            />
          )}
          {[
            { items: revTraits,    title: "Traits" },
            { items: revActions,   title: "Actions" },
            { items: revReactions, title: "Reactions" },
            { items: revLegendary, title: "Legendary Actions" },
          ].filter(({ items }) => items.length > 0).map(({ items, title }) => (
            <div key={title}>
              <p className="text-dnd-brown/60 text-xs font-display uppercase font-semibold tracking-wider mb-1">{title}</p>
              <div className="space-y-1.5">
                {items.map((f) => {
                  const text = (f.entries || []).map((e) =>
                    typeof e === "string" ? render5e(e) : ""
                  ).join(" ");
                  return (
                    <div key={f.name} className="bg-dnd-parchment-dark rounded p-2 border border-dnd-gold-dark/20">
                      <p className="text-dnd-brown font-semibold text-xs mb-0.5">{f.name}</p>
                      {text && <p className="text-dnd-brown/80 text-xs leading-relaxed">{text}</p>}
                    </div>
                  );
                })}
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

function hpCondition(pct, isDead) {
  if (isDead)     return { label: "Defeated",  bar: "bg-gray-400" };
  if (pct >= 75)  return { label: "Healthy",   bar: "bg-green-500" };
  if (pct >= 50)  return { label: "Wounded",   bar: "bg-yellow-500" };
  if (pct >= 25)  return { label: "Bloodied",  bar: "bg-orange-500" };
  return            { label: "Near Death", bar: "bg-red-600" };
}

function RevealedDefenseGroup({ title, badge, items, chipClass, titleClass }) {
  return (
    <div>
      <p className={`text-xs font-display uppercase font-semibold tracking-wider mb-1.5 ${titleClass}`}>
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ key, label }) => (
          <span key={key} className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${chipClass}`}>
            {badge && <span className="font-bold">{badge}</span>}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FeatureRevealPanel (GM view) ────────────────────────────────────────────

function FeatureRevealPanel({
  resistItems, immuneItems, vulnerableItems, conditionItems,
  traits, actions, reactions, legendary,
  isRevealed, toggleReveal,
}) {
  return (
    <div className="border-t border-dnd-gold/20 bg-black/10 p-3 space-y-4">
      <p className="text-dnd-text/30 text-xs italic text-center">
        Click to toggle what players can see in Player View
      </p>

      {vulnerableItems.length > 0 && (
        <FeatureGroup title="Vulnerabilities" titleClass="text-red-400"
          items={vulnerableItems.map((i) => ({ key: `vulnerable_${i.key}`, label: i.label, badge: "2×", badgeClass: "bg-red-900/60 text-red-300" }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
      {resistItems.length > 0 && (
        <FeatureGroup title="Resistances" titleClass="text-blue-400"
          items={resistItems.map((i) => ({ key: `resist_${i.key}`, label: i.label, badge: "½", badgeClass: "bg-blue-900/60 text-blue-300" }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
      {immuneItems.length > 0 && (
        <FeatureGroup title="Immunities" titleClass="text-purple-400"
          items={immuneItems.map((i) => ({ key: `immune_${i.key}`, label: i.label, badge: "0", badgeClass: "bg-purple-900/60 text-purple-300" }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
      {conditionItems.length > 0 && (
        <FeatureGroup title="Condition Immunities" titleClass="text-purple-300"
          items={conditionItems.map((i) => ({ key: `conditionImmune_${i.key}`, label: i.label }))}
          isRevealed={isRevealed} toggleReveal={toggleReveal}
        />
      )}
      {traits.length > 0 && (
        <NamedFeatureGroup title="Traits" features={traits} prefix="trait" isRevealed={isRevealed} toggleReveal={toggleReveal} />
      )}
      {actions.length > 0 && (
        <NamedFeatureGroup title="Actions" features={actions} prefix="action" isRevealed={isRevealed} toggleReveal={toggleReveal} />
      )}
      {reactions.length > 0 && (
        <NamedFeatureGroup title="Reactions" features={reactions} prefix="reaction" isRevealed={isRevealed} toggleReveal={toggleReveal} />
      )}
      {legendary.length > 0 && (
        <NamedFeatureGroup title="Legendary Actions" features={legendary} prefix="legendary" isRevealed={isRevealed} toggleReveal={toggleReveal} />
      )}
    </div>
  );
}

function FeatureGroup({ title, titleClass, items, isRevealed, toggleReveal }) {
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
              title={rev ? "Click to hide from players" : "Click to reveal to players"}
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
  const [openFeature, setOpenFeature] = useState(null);
  return (
    <div>
      <p className="text-xs font-display uppercase font-semibold tracking-wider mb-1.5 text-dnd-text/60">{title}</p>
      <div className="space-y-1">
        {features.map((feature) => {
          const key  = `${prefix}_${feature.name}`;
          const rev  = isRevealed(key);
          const open = openFeature === feature.name;
          const text = (feature.entries || []).map((e) =>
            typeof e === "string" ? render5e(e) : ""
          ).join(" ");
          return (
            <div key={key} className={`rounded border transition-all duration-150 overflow-hidden ${
              rev ? "border-dnd-gold/50 bg-dnd-gold/10" : "border-dnd-text/10 bg-black/20"
            }`}>
              <div className="flex items-center justify-between px-2 py-1.5 gap-2">
                <button onClick={() => setOpenFeature(open ? null : feature.name)} className="flex-1 text-left">
                  <span className={`text-xs font-semibold ${rev ? "text-dnd-gold" : "text-dnd-text/60"}`}>
                    {feature.name}
                  </span>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setOpenFeature(open ? null : feature.name)}
                    className="text-dnd-text/30 hover:text-dnd-text/60 text-xs px-1"
                  >{open ? "▲" : "▼"}</button>
                  <button
                    onClick={() => toggleReveal(key)}
                    title={rev ? "Hide from players" : "Reveal to players"}
                    className={`text-xs px-1.5 py-0.5 rounded border transition-colors duration-150 ${
                      rev
                        ? "border-dnd-gold text-dnd-gold hover:bg-dnd-gold/20"
                        : "border-dnd-text/20 text-dnd-text/30 hover:border-dnd-text/50 hover:text-dnd-text/60"
                    }`}
                  >{rev ? "👁 Shown" : "🔒 Hidden"}</button>
                </div>
              </div>
              {open && text && (
                <div className="px-3 pb-2 border-t border-dnd-gold/10">
                  <p className="text-xs text-dnd-text/70 leading-relaxed pt-1.5">{text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Encounter;
