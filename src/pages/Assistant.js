import React, { useState } from "react";
import MonsterDisplay from "../components/ui/MonsterDisplay";
import CurrentEncounter from "../components/CurrentEncounter";
import Monsters from "../components/Monsters";
import { Link } from "react-router-dom";

function Assistant({ encounter, setEncounter, extraSources }) {
  const [monsterToDisplay, setMonsterToDisplay] = useState(null);

  const handlePreview = (monster) => {
    setMonsterToDisplay(monster);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left column: encounter builder */}
      <div className="flex flex-col gap-4 w-full xl:w-80 shrink-0">
        {/* Monster preview */}
        <section>
          <h2 className="section-title">Monster Preview</h2>
          <MonsterDisplay monster={monsterToDisplay || { name: "None" }} />
        </section>

        {/* Current encounter */}
        <CurrentEncounter encounter={encounter} setEncounter={setEncounter} />

        {/* Send to encounter button */}
        <div>
          {encounter.length > 0 ? (
            <Link
              to="/encounter"
              className="btn-dnd-primary block text-center w-full no-underline"
            >
              ⚔ Run Encounter
            </Link>
          ) : (
            <button
              disabled
              className="btn-dnd-primary w-full opacity-30 cursor-not-allowed"
            >
              ⚔ Run Encounter
            </button>
          )}
        </div>
      </div>

      {/* Right column: bestiary */}
      <div className="flex-1 min-w-0">
        <h2 className="section-title">Build Your Encounter</h2>
        <Monsters
          setEncounter={setEncounter}
          extraSources={extraSources}
          onPreview={handlePreview}
        />
      </div>
    </div>
  );
}

export default Assistant;
