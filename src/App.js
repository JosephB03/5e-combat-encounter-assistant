import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./assets/App.css";
import Header from "./components/Header";
import Assistant from "./pages/Assistant";
import About from "./pages/About";
import Import from "./pages/Import";
import Encounter from "./pages/Encounter";
import PF2eAssistant from "./pages/PF2eAssistant";
import PF2eEncounter from "./pages/PF2eEncounter";

function App() {
  const [mode, setMode] = useState("5e"); // "5e" | "pf2e"

  // 5e state
  const [encounter5e, setEncounter5e] = useState([]);
  const [extraSources, setExtraSources] = useState(() => {
    try { return JSON.parse(localStorage.getItem("extraSources") || "[]"); }
    catch { return []; }
  });

  // PF2e state
  const [encounterPF2e, setEncounterPF2e] = useState([]);
  const [pf2ePartyLevel, setPf2ePartyLevel] = useState(5);

  return (
    <Router>
      <div className="min-h-screen bg-dnd-dark font-body">
        <Header mode={mode} setMode={setMode} />
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          {mode === "5e" ? (
            <Routes>
              <Route
                path="/"
                element={
                  <Assistant
                    encounter={encounter5e}
                    setEncounter={setEncounter5e}
                    extraSources={extraSources}
                  />
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/import"
                element={
                  <Import extraSources={extraSources} setExtraSources={setExtraSources} />
                }
              />
              <Route
                path="/encounter"
                element={<Encounter encounter={encounter5e} />}
              />
              {/* Fallback for any other path in 5e mode */}
              <Route
                path="*"
                element={
                  <Assistant
                    encounter={encounter5e}
                    setEncounter={setEncounter5e}
                    extraSources={extraSources}
                  />
                }
              />
            </Routes>
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <PF2eAssistant
                    encounter={encounterPF2e}
                    setEncounter={setEncounterPF2e}
                    partyLevel={pf2ePartyLevel}
                    setPartyLevel={setPf2ePartyLevel}
                  />
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/pf2e"
                element={
                  <PF2eAssistant
                    encounter={encounterPF2e}
                    setEncounter={setEncounterPF2e}
                    partyLevel={pf2ePartyLevel}
                    setPartyLevel={setPf2ePartyLevel}
                  />
                }
              />
              <Route
                path="/pf2e-encounter"
                element={
                  <PF2eEncounter
                    encounter={encounterPF2e}
                    defaultPartyLevel={pf2ePartyLevel}
                  />
                }
              />
              {/* Fallback */}
              <Route
                path="*"
                element={
                  <PF2eAssistant
                    encounter={encounterPF2e}
                    setEncounter={setEncounterPF2e}
                    partyLevel={pf2ePartyLevel}
                    setPartyLevel={setPf2ePartyLevel}
                  />
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
