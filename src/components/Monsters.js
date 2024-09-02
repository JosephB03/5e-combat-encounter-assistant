import React, { useState, useEffect } from "react";
import MonsterTable from "./MonsterTable";
import Search from "./ui/Search";
import monsterData from "../data/bestiary-mm.json";

function Monsters({setEncounter}) {
  const [begin, setBegin] = useState(0);
  const [search, setSearch] = useState("");
  const [monsters, setMonsters] = useState([]);

  useEffect(() => {
    setMonsters(monsterData.monster);
  }, []);

  useEffect(() => {
    setBegin(0);
  }, [search]);

  let filteredMonsters = monsters.filter((monster) =>
    monster.name.includes(search)
  );

  if (filteredMonsters.length === 0) {
    filteredMonsters = monsters;
  }

  const handleSlideBack = () => {
    setBegin((prev) => {
      const newBegin = prev - 10;
      if (newBegin < 0) {
        return 0;
      }
      return newBegin;
    });
  };

  const handleSlideForward = () => {
    setBegin((prev) => {
      const newBegin = prev + 10;
      if (newBegin >= filteredMonsters.length) {
        return filteredMonsters.length - 10;
      }
      return newBegin;
    });
  };

  const handleAdd = (monster) => {
    setEncounter((prev) => [...prev, monster]);
  }; 

  return (
    <section>
      <h2>Monsters</h2>
      <Search setSearch={setSearch} />
      <MonsterTable begin={begin} monsters={filteredMonsters} handleAdd={handleAdd} />
      <ul>
        <li>
          <button onClick={handleSlideBack}>&lt;</button>
        </li>
        <li>
          <button onClick={handleSlideForward}>&gt;</button>
        </li>
      </ul>
    </section>
  );
}

export default Monsters;
