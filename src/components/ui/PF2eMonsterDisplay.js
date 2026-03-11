import React from "react";

const ACTION_ICONS = { 1: "◆", 2: "◆◆", 3: "◆◆◆", reaction: "↺", free: "◇" };

function mod(v) {
  return v >= 0 ? `+${v}` : `${v}`;
}

function PF2eMonsterDisplay({ creature }) {
  if (!creature || creature.name === "None") {
    return (
      <div className="panel-dnd p-6 text-center text-dnd-text/40 italic text-sm">
        Click a creature to preview its stat block.
      </div>
    );
  }

  const { saves = {}, speed = {}, resistances = [], weaknesses = [], immunities = [] } = creature;

  const speedStr = Object.entries(speed)
    .map(([k, v]) => (k === "walk" ? `${v} ft.` : `${k} ${v} ft.`))
    .join(", ");

  return (
    <div className="panel-parchment text-dnd-brown text-xs overflow-y-auto max-h-[600px]">
      {/* Name + level */}
      <div className="px-4 pt-3 pb-2 border-b-2 border-dnd-red">
        <div className="flex justify-between items-baseline">
          <h3 className="font-display font-bold text-lg leading-tight">{creature.name}</h3>
          <span className="font-display font-bold text-dnd-red text-sm">Level {creature.level}</span>
        </div>
        <p className="italic text-dnd-brown/70">
          {creature.size}{creature.traits?.length ? ` ${creature.traits.join(", ")}` : ""}
        </p>
      </div>

      <div className="px-4 py-2 space-y-1.5 border-b border-dnd-parchment-dark">
        <p><span className="font-semibold text-dnd-red">Perception</span> {mod(creature.perception)}</p>
        {creature.languages?.length > 0 && (
          <p><span className="font-semibold text-dnd-red">Languages</span> {creature.languages.join(", ")}</p>
        )}
        {creature.skills && Object.keys(creature.skills).length > 0 && (
          <p>
            <span className="font-semibold text-dnd-red">Skills</span>{" "}
            {Object.entries(creature.skills).map(([k, v]) => `${k} ${mod(v)}`).join(", ")}
          </p>
        )}
      </div>

      {/* Ability modifiers */}
      <div className="px-4 py-2 border-b border-dnd-parchment-dark">
        <div className="grid grid-cols-6 gap-1 text-center">
          {["str", "dex", "con", "int", "wis", "cha"].map((ab) => (
            <div key={ab}>
              <p className="text-dnd-red font-bold uppercase text-xs">{ab.toUpperCase()}</p>
              <p className="font-bold">{mod(creature[ab] ?? 0)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      {creature.items?.length > 0 && (
        <div className="px-4 py-1.5 border-b border-dnd-parchment-dark">
          <span className="font-semibold text-dnd-red">Items</span>{" "}
          {creature.items.join(", ")}
        </div>
      )}

      {/* Defenses */}
      <div className="px-4 py-2 bg-dnd-red/5 border-b border-dnd-parchment-dark space-y-1">
        <p><span className="font-semibold text-dnd-red">AC</span> {creature.ac}</p>
        <p>
          <span className="font-semibold text-dnd-red">Fort</span> {mod(saves.fort ?? 0)},{" "}
          <span className="font-semibold text-dnd-red">Ref</span> {mod(saves.ref ?? 0)},{" "}
          <span className="font-semibold text-dnd-red">Will</span> {mod(saves.will ?? 0)}
        </p>
        <p><span className="font-semibold text-dnd-red">HP</span> {creature.hp}</p>
        {immunities.length > 0 && (
          <p><span className="font-semibold text-dnd-red">Immunities</span> {immunities.join(", ")}</p>
        )}
        {resistances.length > 0 && (
          <p>
            <span className="font-semibold text-dnd-red">Resistances</span>{" "}
            {resistances.map((r) => `${r.type} ${r.value}${r.note ? ` (${r.note})` : ""}`).join(", ")}
          </p>
        )}
        {weaknesses.length > 0 && (
          <p>
            <span className="font-semibold text-dnd-red">Weaknesses</span>{" "}
            {weaknesses.map((w) => `${w.type}${w.value ? ` ${w.value}` : ""}${w.note ? ` (${w.note})` : ""}`).join(", ")}
          </p>
        )}
      </div>

      {/* Speed */}
      <div className="px-4 py-1.5 border-b border-dnd-parchment-dark">
        <span className="font-semibold text-dnd-red">Speed</span> {speedStr}
      </div>

      {/* Actions */}
      {creature.actions?.length > 0 && (
        <div className="px-4 py-2 space-y-2 border-b border-dnd-parchment-dark">
          {creature.actions.map((action, i) => (
            <div key={i}>
              <span className="font-bold text-dnd-brown">{action.name}</span>
              {action.cost !== undefined && (
                <span className="text-dnd-red ml-1 font-mono">{ACTION_ICONS[action.cost] || action.cost}</span>
              )}
              {action.traits?.length > 0 && (
                <span className="text-dnd-brown/60 italic ml-1">({action.traits.join(", ")})</span>
              )}
              {action.type === "Strike" && (
                <span className="ml-1">
                  {mod(action.attack)} to hit, {action.damage} {action.damageType}
                  {action.range ? `, ${action.range}` : ""}
                  {action.note ? `; ${action.note}` : ""}
                </span>
              )}
              {action.description && (
                <p className="text-dnd-brown/80 mt-0.5 leading-relaxed">{action.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Special abilities */}
      {creature.abilities?.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          {creature.abilities.map((ability, i) => (
            <div key={i}>
              <span className="font-bold text-dnd-brown">{ability.name}</span>
              {ability.cost !== undefined && (
                <span className="text-dnd-red ml-1 font-mono">{ACTION_ICONS[ability.cost] || ability.cost}</span>
              )}
              {ability.description && (
                <p className="text-dnd-brown/80 mt-0.5 leading-relaxed">{ability.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="px-4 py-2 text-dnd-brown/40 italic text-right border-t border-dnd-parchment-dark">
        Source: {creature.source}
      </p>
    </div>
  );
}

export default PF2eMonsterDisplay;
