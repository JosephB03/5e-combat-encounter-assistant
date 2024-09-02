import React, { useState, useEffect } from "react";
import MonsterDisplay from "../components/ui/MonsterDisplay";
import CurrentEncounter from "../components/CurrentEncounter";
import Monsters from "../components/Monsters";
import { Link } from "react-router-dom";

function Assistant() {
  const [encounter, setEncounter] = useState([]);
  const [monsterToDisplay, setMonsterToDisplay] = useState({ name: "None" });

  useEffect(() => {
    if (encounter.length === 0) {
      setMonsterToDisplay({ name: "None" });
    } else {
      setMonsterToDisplay(encounter[encounter.length - 1]);
    }
  }, [encounter]);

  return (
    <>
      <section>
        <h2>Your Encounter</h2>
        <section>
          <h3>
            {encounter.length > 0 ? monsterToDisplay.name : "Monster Display"}
          </h3>
          <MonsterDisplay monster={monsterToDisplay} />
        </section>
        <CurrentEncounter encounter={encounter} setEncounter={setEncounter} />
        {encounter.length > 0 ? (
          <button>
            <Link
              to={{
                pathname: "/encounter",
                state: { encounter: encounter },
              }}
            >
              Send to assistant
            </Link>
          </button>
        ) : (
          <button disabled>Send to assistant</button>
        )}
      </section>
      <Monsters setEncounter={setEncounter} />
    </>
  );
}

export default Assistant;
