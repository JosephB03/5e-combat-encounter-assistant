import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./assets/App.css";
import Header from "./components/Header";
import Assistant from "./pages/Assistant";
import About from "./pages/About";
import Import from "./pages/Import";
import Encounter from "./pages/Encounter";

function App() {
  // Single page web app, create functionality for switching pages
  return (
    <Router>
      <>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Assistant />} />
            <Route path="/about" element={<About />} />
            <Route path="/import" element={<Import />} />
            <Route path="/encounter" element={<Encounter />} />
          </Routes>
        </main>
      </>
    </Router>
  );
}

export default App;
