import React, { useState, useEffect } from "react";

function CurrentEncounter({ encounter, setEncounter }) {
  const [repeats, setRepeats] = useState({});

  const generateMonsterKey = (monster) => `${monster.name}_${monster.source}`; 
  let monsterKey = '';

  useEffect(() => {
    let newRepeats = {};
    for (let monster of encounter) {
      monsterKey = generateMonsterKey(monster);
      if (monsterKey in newRepeats) {
        newRepeats[monsterKey].count++;
      } else {
        newRepeats[monsterKey] = {
          count: 1,
          monsterData: monster
        };
      }
    }
    setRepeats(newRepeats);
  }, [encounter]);

  const handleRemove = (monsterKey) => {
    let removed = false;
    setEncounter((prev) => prev.filter((item) => {
      const itemKey = generateMonsterKey(item);
      if (!removed && itemKey === monsterKey) {
        removed = true;
        return false
      }
      return true;
    }));
  };

  const handleClear = () => {
    setEncounter([]);
  }

  return (
    <section>
      <h2>Current Encounter</h2>
      <ul>
        {Object.keys(repeats).map((monsterKey, index) => (
          <li key={index}>
            {monsterKey.split('_')[0] + " " + repeats[monsterKey].count}
            <button onClick={() => handleRemove(monsterKey)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleClear()} >Clear encounter</button>
    </section>
  );
}

CurrentEncounter.defaultProps = {
  encounter: [],
};

export default CurrentEncounter;
