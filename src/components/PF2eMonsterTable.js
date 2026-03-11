import React from "react";

function levelBadgeClass(level) {
  if (level <= -1) return "bg-dnd-text/20 text-dnd-text/60";
  if (level <= 3)  return "bg-green-900/40 text-green-400";
  if (level <= 7)  return "bg-yellow-900/40 text-yellow-400";
  if (level <= 12) return "bg-orange-900/40 text-orange-400";
  return "bg-red-900/40 text-red-400";
}

function PF2eMonsterTable({ begin = 0, creatures, handleAdd, onPreview }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-dnd-gold/20">
      <table className="table-dnd">
        <thead>
          <tr>
            <th className="w-16">Add</th>
            <th>Name</th>
            <th>Level</th>
            <th>Size</th>
            <th>Traits</th>
            <th>HP</th>
            <th>AC</th>
          </tr>
        </thead>
        <tbody>
          {creatures.slice(begin, begin + 15).map((creature, index) => (
            <tr
              key={index}
              className="cursor-pointer"
              onClick={() => onPreview && onPreview(creature)}
            >
              <td onClick={(e) => e.stopPropagation()}>
                <button className="btn-dnd-sm" onClick={() => handleAdd(creature)}>
                  + Add
                </button>
              </td>
              <td>
                <span className="font-semibold text-dnd-text">{creature.name}</span>
                {creature.rarity !== "Common" && (
                  <span className="ml-2 text-xs text-dnd-gold/60 italic">{creature.rarity}</span>
                )}
              </td>
              <td>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${levelBadgeClass(creature.level)}`}>
                  {creature.level >= 0 ? `+${creature.level}` : creature.level}
                </span>
              </td>
              <td className="text-dnd-text/70">{creature.size}</td>
              <td className="text-dnd-text/60 text-xs">
                {(creature.traits || []).join(", ")}
              </td>
              <td className="text-dnd-gold font-semibold">{creature.hp}</td>
              <td className="text-dnd-gold font-semibold">{creature.ac}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PF2eMonsterTable;
