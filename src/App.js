import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./assets/App.css";
import Header from "./components/Header";
import Assistant from "./pages/Assistant";
import About from "./pages/About";
import Import from "./pages/Import";
import Encounter from "./pages/Encounter";

function App() {
  const [encounter, setEncounter] = useState([]);
  const [extraSources, setExtraSources] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("extraSources") || "[]");
    } catch {
      return [];
    }
  });

  return (
    <Router>
      <div className="min-h-screen bg-dnd-dark font-body">
        <Header />
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <Assistant
                  encounter={encounter}
                  setEncounter={setEncounter}
                  extraSources={extraSources}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/import"
              element={
                <Import
                  extraSources={extraSources}
                  setExtraSources={setExtraSources}
                />
              }
            />
            <Route
              path="/encounter"
              element={<Encounter encounter={encounter} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
