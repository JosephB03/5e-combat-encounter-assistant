# Encounter Assistant

A multi-system combat encounter builder and tracker for tabletop RPG Game Masters, supporting **D&D 5th Edition** and **Pathfinder 2nd Edition**.

## Features

### D&D 5e Mode

**Encounter Builder**
- Browse monsters from the Monster Manual and 14 additional sourcebooks (Volo's Guide, Mordenkainen's, etc.)
- Import homebrew monsters from any 5etools-format JSON file
- Per-source toggle: enable/disable sourcebooks individually
- Encounter XP budget using the official DMG multiplier table (×1 for 1 monster → ×4 for 15+), scaled for party size
- Difficulty tiers: Easy / Medium / Hard / Deadly

**Encounter Runner**
- Per-instance HP tracking with visual bars for every monster
- GM feature reveal: individually toggle resistances, immunities, vulnerabilities, traits, actions, and reactions as known to players
- Player view: parchment-style cards showing abstract HP conditions (Healthy / Wounded / Bloodied / Near Death / Defeated) and revealed abilities only
- Monster images loaded from Firebase Storage where available

### Pathfinder 2e Mode

**Encounter Builder**
- 32 creatures from **Monster Core** and **Monster Core 2** spanning levels −1 to 19
- XP budget system: each creature costs XP based on its level relative to the party (same level = 40 XP, +4 levels = 160 XP)
- Difficulty tiers: Low / Moderate / Severe / Extreme, scaled for party size
- **Elite / Weak variant toggle** per creature: Elite raises level by 1 and all stats by 2, Weak lowers them; XP cost automatically adjusts

**Encounter Runner**
- Three-action economy display (◆ ◆◆ ◆◆◆ ↺ ◇) in stat blocks
- AC, Fortitude / Reflex / Will saves in a 5-column stat row
- Weaknesses with specific damage values (e.g. Fire 10)
- Per-creature HP tracking, GM feature reveal, and parchment player view
- Elite / Weak badges shown on all cards

## Tech Stack

- **React 18** with Create React App
- **React Router v6**
- **Tailwind CSS v3** with a custom D&D Beyond-inspired color palette
- **Firebase Storage** for monster images
- Custom D&D Beyond-style component library (`panel-dnd`, `panel-parchment`, `btn-dnd-*`, etc.)

## Data Sources

**D&D 5e** monster data is sourced from [5etools](https://5e.tools/) (community-maintained reference). Dungeons & Dragons is a trademark of Wizards of the Coast LLC.

**Pathfinder 2e** creature data is derived from *Monster Core* and *Monster Core 2*, published by Paizo Inc. Pathfinder is a trademark of Paizo Inc. Stats used under the ORC License / Community Use Policy.

This tool is unofficial and not affiliated with Wizards of the Coast or Paizo Inc.

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```
