import React from "react";

const SIZES = {
  T: "Tiny",
  S: "Small",
  M: "Medium",
  L: "Large",
  H: "Huge",
  G: "Gargantuan",
};

function MonsterTable({ begin = 0, monsters, handleAdd, onPreview }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-dnd-gold/20">
      <table className="table-dnd">
        <thead>
          <tr>
            <th className="w-16">Add</th>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>CR</th>
          </tr>
        </thead>
        <tbody>
          {monsters.slice(begin, begin + 10).map((monster, index) => (
            <tr
              key={index}
              className="cursor-pointer"
              onClick={() => onPreview && onPreview(monster)}
            >
              <td onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-dnd-sm"
                  onClick={() => handleAdd(monster)}
                >
                  + Add
                </button>
              </td>
              <td>
                <span className="font-semibold text-dnd-text">{monster.name}</span>
                {monster.source && (
                  <span className="ml-2 text-xs text-dnd-text/40 italic">
                    {monster.source}
                  </span>
                )}
              </td>
              <td className="text-dnd-text/70">
                {SIZES[Array.isArray(monster.size) ? monster.size[0] : monster.size] || monster.size}
              </td>
              <td className="text-dnd-text/70 capitalize">
                {typeof monster.type === "object" ? monster.type.type : monster.type}
              </td>
              <td className="text-dnd-gold font-semibold">
                {typeof monster.cr === "object" ? monster.cr.cr : monster.cr}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonsterTable;
