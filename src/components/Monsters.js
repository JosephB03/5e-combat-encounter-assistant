import React, { useState, useEffect } from "react";
import MonsterTable from "./MonsterTable";
import Search from "./ui/Search";
import baseMonsterData from "../data/bestiary-mm.json";

function Monsters({ setEncounter, extraSources = [], onPreview }) {
  const [begin, setBegin] = useState(0);
  const [search, setSearch] = useState("");
  const [monsters, setMonsters] = useState([]);

  useEffect(() => {
    // Load base MM monsters + any extra sources merged from localStorage
    const base = baseMonsterData.monster || [];
    let extra = [];
    try {
      extra = JSON.parse(localStorage.getItem("customMonsters") || "[]");
    } catch {
      extra = [];
    }
    setMonsters([...base, ...extra]);
  }, [extraSources]);

  useEffect(() => {
    setBegin(0);
  }, [search]);

  const filteredMonsters =
    search.trim() === ""
      ? monsters
      : monsters.filter((m) =>
          m.name.toLowerCase().includes(search.toLowerCase())
        );

  const pageCount = Math.ceil(filteredMonsters.length / 10);
  const currentPage = Math.floor(begin / 10) + 1;

  const handleSlideBack = () => {
    setBegin((prev) => Math.max(0, prev - 10));
  };

  const handleSlideForward = () => {
    setBegin((prev) => {
      const next = prev + 10;
      return next < filteredMonsters.length ? next : prev;
    });
  };

  const handleAdd = (monster) => {
    setEncounter((prev) => [...prev, monster]);
  };

  return (
    <section className="panel-dnd p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="section-title mb-0 border-0 pb-0">
          Bestiary
          <span className="ml-2 text-dnd-text/40 font-body font-normal normal-case tracking-normal text-xs">
            ({filteredMonsters.length} monsters)
          </span>
        </h2>
      </div>

      <Search setSearch={setSearch} />

      <MonsterTable
        begin={begin}
        monsters={filteredMonsters}
        handleAdd={handleAdd}
        onPreview={onPreview}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSlideBack}
          disabled={begin === 0}
          className="btn-dnd-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="text-dnd-text/60 text-sm font-body">
          Page {currentPage} / {pageCount || 1}
        </span>
        <button
          onClick={handleSlideForward}
          disabled={begin + 10 >= filteredMonsters.length}
          className="btn-dnd-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </section>
  );
}

export default Monsters;
