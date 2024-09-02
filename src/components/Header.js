import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <Link to="/">
        <section>
          <h1>5e Encounter Assistant</h1>
          <p>Img here</p>
        </section>
      </Link>
      <nav>
        <ul>
          <li>Light/Dark WIP</li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/import">Import Homebrew</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
