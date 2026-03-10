import React, { useState, useRef } from "react";

const AVAILABLE_SOURCES = [
  { file: "bestiary-vgm", label: "Volo's Guide to Monsters", abbr: "VGM" },
  { file: "bestiary-mtf", label: "Mordenkainen's Tome of Foes", abbr: "MTF" },
  { file: "bestiary-mpmm", label: "Mordenkainen Presents: Monsters of the Multiverse", abbr: "MPMM" },
  { file: "bestiary-tce", label: "Tasha's Cauldron of Everything", abbr: "TCE" },
  { file: "bestiary-ftd", label: "Fizban's Treasury of Dragons", abbr: "FTD" },
  { file: "bestiary-bgdia", label: "Baldur's Gate: Descent into Avernus", abbr: "BGDIA" },
  { file: "bestiary-cos", label: "Curse of Strahd", abbr: "COS" },
  { file: "bestiary-oota", label: "Out of the Abyss", abbr: "OotA" },
  { file: "bestiary-skt", label: "Storm King's Thunder", abbr: "SKT" },
  { file: "bestiary-vrgr", label: "Van Richten's Guide to Ravenloft", abbr: "VRGR" },
  { file: "bestiary-bgg", label: "Bigby Presents: Glory of the Giants", abbr: "BGG" },
  { file: "bestiary-wbtw", label: "The Wild Beyond the Witchlight", abbr: "WBtW" },
  { file: "bestiary-xge", label: "Xanathar's Guide to Everything", abbr: "XGE" },
  { file: "bestiary-toa", label: "Tomb of Annihilation", abbr: "ToA" },
];

function Import({ extraSources, setExtraSources }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef();

  const isActive = (abbr) => extraSources.includes(abbr);

  const handleToggleSource = async (source) => {
    if (isActive(source.abbr)) {
      // Remove this source
      const newSources = extraSources.filter((s) => s !== source.abbr);
      setExtraSources(newSources);
      localStorage.setItem("extraSources", JSON.stringify(newSources));
      rebuildCustomMonsters(newSources);
      return;
    }

    // Load from the public folder
    setLoading(source.abbr);
    setError("");
    try {
      const res = await fetch(`${process.env.PUBLIC_URL}/data/bestiary/${source.file}.json`);
      if (!res.ok) throw new Error(`Could not load ${source.abbr} (${res.status})`);
      const data = await res.json();
      const monsters = data.monster || [];
      if (monsters.length === 0) throw new Error("No monsters found in file");

      const newSources = [...extraSources, source.abbr];
      setExtraSources(newSources);
      localStorage.setItem("extraSources", JSON.stringify(newSources));

      // Merge new monsters into custom monsters cache
      const existing = JSON.parse(localStorage.getItem("customMonsters") || "[]");
      const merged = [...existing, ...monsters];
      localStorage.setItem("customMonsters", JSON.stringify(merged));
    } catch (e) {
      setError(`Failed to load ${source.abbr}: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  const rebuildCustomMonsters = (activeSources) => {
    // If all sources removed, clear cache
    if (activeSources.length === 0) {
      localStorage.removeItem("customMonsters");
      return;
    }
    // Otherwise reload all active sources
    setLoading("rebuild");
    Promise.all(
      AVAILABLE_SOURCES.filter((s) => activeSources.includes(s.abbr)).map((s) =>
        fetch(`${process.env.PUBLIC_URL}/data/bestiary/${s.file}.json`)
          .then((r) => r.json())
          .then((d) => d.monster || [])
          .catch(() => [])
      )
    ).then((results) => {
      const merged = results.flat();
      localStorage.setItem("customMonsters", JSON.stringify(merged));
      setLoading(null);
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus("Reading file...");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        const monsters = data.monster || [];
        if (monsters.length === 0) throw new Error("No 'monster' array found in JSON");
        const existing = JSON.parse(localStorage.getItem("customMonsters") || "[]");
        const merged = [...existing, ...monsters];
        localStorage.setItem("customMonsters", JSON.stringify(merged));
        setUploadStatus(`Imported ${monsters.length} monsters from ${file.name}`);
      } catch (err) {
        setUploadStatus(`Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    setExtraSources([]);
    localStorage.removeItem("extraSources");
    localStorage.removeItem("customMonsters");
    setUploadStatus("");
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="page-title">Bestiary Sources</h1>
        <p className="text-dnd-text/60 text-sm">
          Enable additional D&amp;D sourcebooks to expand the bestiary on the Builder page.
          Source data is loaded from the included bestiary files.
        </p>
      </div>

      {error && (
        <div className="bg-dnd-red/20 border border-dnd-red/50 text-dnd-text rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Official sources */}
      <section className="panel-dnd p-4">
        <h2 className="section-title">Official Sourcebooks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_SOURCES.map((source) => {
            const active = isActive(source.abbr);
            const isLoading = loading === source.abbr || loading === "rebuild";
            return (
              <button
                key={source.abbr}
                onClick={() => handleToggleSource(source)}
                disabled={isLoading}
                className={`flex items-center gap-3 px-4 py-3 rounded border transition-all duration-150 text-left ${
                  active
                    ? "bg-dnd-gold/10 border-dnd-gold text-dnd-gold"
                    : "bg-transparent border-dnd-text/20 text-dnd-text/70 hover:border-dnd-gold/50 hover:text-dnd-text"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                  active ? "bg-dnd-gold border-dnd-gold" : "border-dnd-text/40"
                }`}>
                  {active && <span className="text-dnd-darker text-xs font-bold leading-none">✓</span>}
                </span>
                <span>
                  <span className="font-display text-sm font-semibold block">{source.abbr}</span>
                  <span className="text-xs opacity-70">{source.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom JSON upload */}
      <section className="panel-dnd p-4">
        <h2 className="section-title">Custom JSON Import</h2>
        <p className="text-dnd-text/60 text-sm mb-3">
          Upload a homebrew bestiary JSON file in 5etools format (must have a <code className="text-dnd-gold bg-black/30 px-1 rounded">monster</code> array).
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            className="btn-dnd-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileUpload}
          />
          {uploadStatus && (
            <span className={`text-sm ${uploadStatus.startsWith("Error") ? "text-dnd-red" : "text-green-400"}`}>
              {uploadStatus}
            </span>
          )}
        </div>
      </section>

      {/* Status + clear */}
      <section className="panel-dnd p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-dnd-text/60 text-sm">
          {extraSources.length > 0
            ? `${extraSources.length} additional source${extraSources.length !== 1 ? "s" : ""} enabled: ${extraSources.join(", ")}`
            : "Only the Monster Manual (MM) is currently loaded."}
        </p>
        {extraSources.length > 0 && (
          <button onClick={handleClearAll} className="btn-dnd-ghost">
            Clear All Sources
          </button>
        )}
      </section>
    </div>
  );
}

export default Import;
