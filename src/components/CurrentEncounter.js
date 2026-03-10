import React, { useState, useEffect } from "react";

function CurrentEncounter({ encounter = [], setEncounter }) {
  const [repeats, setRepeats] = useState({});

  const generateMonsterKey = (monster) => `${monster.name}_${monster.source}`;

  useEffect(() => {
    const newRepeats = {};
    for (const monster of encounter) {
      const key = generateMonsterKey(monster);
      if (key in newRepeats) {
        newRepeats[key].count++;
      } else {
        newRepeats[key] = { count: 1, monsterData: monster };
      }
    }
    setRepeats(newRepeats);
  }, [encounter]);

  const handleRemove = (monsterKey) => {
    let removed = false;
    setEncounter((prev) =>
      prev.filter((item) => {
        const itemKey = generateMonsterKey(item);
        if (!removed && itemKey === monsterKey) {
          removed = true;
          return false;
        }
        return true;
      })
    );
  };

  const handleClear = () => {
    setEncounter([]);
  };

  const totalMonsters = encounter.length;

  return (
    <section className="panel-dnd p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0 border-0 pb-0">
          Current Encounter
          {totalMonsters > 0 && (
            <span className="ml-2 text-dnd-text/40 font-body font-normal normal-case tracking-normal text-xs">
              ({totalMonsters})
            </span>
          )}
        </h2>
        {totalMonsters > 0 && (
          <button onClick={handleClear} className="btn-dnd-ghost">
            Clear All
          </button>
        )}
      </div>

      {Object.keys(repeats).length === 0 ? (
        <p className="text-dnd-text/40 italic text-sm text-center py-4">
          No monsters added yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {Object.keys(repeats).map((monsterKey, index) => {
            const { count, monsterData } = repeats[monsterKey];
            return (
              <li
                key={index}
                className="flex items-center justify-between bg-black/20 rounded px-3 py-2 border border-dnd-gold/10"
              >
                <div className="flex items-center gap-2">
                  {count > 1 && (
                    <span className="bg-dnd-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </span>
                  )}
                  <span className="text-dnd-text text-sm font-semibold">{monsterData.name}</span>
                  <span className="text-dnd-text/40 text-xs italic">{monsterData.source}</span>
                </div>
                <button
                  onClick={() => handleRemove(monsterKey)}
                  className="text-dnd-text/40 hover:text-dnd-red transition-colors duration-150 text-xs px-2 py-1 rounded hover:bg-dnd-red/10"
                  title="Remove one"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default CurrentEncounter;
