import React, { useState } from "react";
import PF2eMonsterTable from "./PF2eMonsterTable";
import Search from "./ui/Search";
import bestiaryData from "../data/pf2e-bestiary.json";

const ALL_CREATURES = bestiaryData.creatures;
const PAGE_SIZE = 15;

function PF2eMonsters({ setEncounter, onPreview }) {
  const [begin, setBegin] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name" | "level"

  const handleSearch = (val) => {
    setSearch(val);
    setBegin(0);
  };

  const filtered = ALL_CREATURES
    .filter((c) =>
      search.trim() === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.traits || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortBy === "level" ? a.level - b.level : a.name.localeCompare(b.name)
    );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.floor(begin / PAGE_SIZE) + 1;

  const handleAdd = (creature) => {
    setEncounter((prev) => [...prev, creature]);
  };

  return (
    <section className="panel-dnd p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="section-title mb-0 border-0 pb-0">
          Bestiary
          <span className="ml-2 text-dnd-text/40 font-body font-normal normal-case tracking-normal text-xs">
            ({filtered.length} creatures)
          </span>
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setSortBy("name")}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              sortBy === "name"
                ? "border-dnd-gold text-dnd-gold bg-dnd-gold/10"
                : "border-dnd-text/20 text-dnd-text/50 hover:border-dnd-gold/50"
            }`}
          >
            A–Z
          </button>
          <button
            onClick={() => setSortBy("level")}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              sortBy === "level"
                ? "border-dnd-gold text-dnd-gold bg-dnd-gold/10"
                : "border-dnd-text/20 text-dnd-text/50 hover:border-dnd-gold/50"
            }`}
          >
            Level
          </button>
        </div>
      </div>

      <Search setSearch={handleSearch} />

      <PF2eMonsterTable
        begin={begin}
        creatures={filtered}
        handleAdd={handleAdd}
        onPreview={onPreview}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setBegin((p) => Math.max(0, p - PAGE_SIZE))}
          disabled={begin === 0}
          className="btn-dnd-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <span className="text-dnd-text/60 text-sm">
          Page {currentPage} / {pageCount || 1}
        </span>
        <button
          onClick={() => setBegin((p) => (p + PAGE_SIZE < filtered.length ? p + PAGE_SIZE : p))}
          disabled={begin + PAGE_SIZE >= filtered.length}
          className="btn-dnd-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </section>
  );
}

export default PF2eMonsters;
