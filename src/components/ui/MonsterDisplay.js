import React, { useState, useEffect } from "react";
import { storage } from "../other/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

const ABILITY_NAMES = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

function modifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function getAC(ac) {
  if (!ac || ac.length === 0) return "—";
  const first = ac[0];
  if (typeof first === "number") return first;
  if (typeof first === "object") return first.ac;
  return first;
}

function getHP(hp) {
  if (!hp) return "—";
  if (typeof hp === "number") return hp;
  return `${hp.average} (${hp.formula})`;
}

function getSpeed(speed) {
  if (!speed) return "—";
  return Object.entries(speed)
    .map(([k, v]) => (k === "walk" ? `${v} ft.` : `${k} ${v} ft.`))
    .join(", ");
}

function getCR(cr) {
  if (!cr) return "—";
  return typeof cr === "object" ? cr.cr : cr;
}

function getSize(size) {
  const sizes = { T: "Tiny", S: "Small", M: "Medium", L: "Large", H: "Huge", G: "Gargantuan" };
  if (!size) return "—";
  const code = Array.isArray(size) ? size[0] : size;
  return sizes[code] || code;
}

function getType(type) {
  if (!type) return "—";
  return typeof type === "object" ? type.type : type;
}

function MonsterDisplay({ monster }) {
  const [imgURL, setImgURL] = useState("");

  useEffect(() => {
    if (!monster || monster.name === "None") {
      setImgURL("");
      return;
    }
    const newRef = ref(
      storage,
      "bestiary-imgs/" + monster.source + "/" + monster.name + ".webp"
    );
    getDownloadURL(newRef)
      .then((url) => setImgURL(url))
      .catch(() => setImgURL(""));
  }, [monster]);

  if (!monster || monster.name === "None") {
    return (
      <div className="panel-dnd p-6 text-center text-dnd-text/40 italic text-sm">
        Select a monster from the table below to preview it here.
      </div>
    );
  }

  return (
    <div className="stat-block">
      {/* Header */}
      <div className="border-b-2 border-dnd-red pb-3 mb-3">
        <h3 className="font-display text-dnd-brown font-bold text-xl leading-tight">{monster.name}</h3>
        <p className="text-dnd-brown/70 text-sm italic">
          {getSize(monster.size)} {getType(monster.type)}
          {monster.alignment && ` — ${monster.alignment}`}
        </p>
      </div>

      {/* Monster image */}
      {imgURL && (
        <div className="mb-3 flex justify-center">
          <img
            src={imgURL}
            alt={"Image of " + monster.name}
            className="max-h-40 rounded border border-dnd-parchment-dark shadow-sm object-contain"
          />
        </div>
      )}

      {/* Core stats */}
      <div className="border-b border-dnd-red/30 pb-2 mb-2 space-y-1">
        <p className="text-sm">
          <span className="font-semibold text-dnd-red">Armor Class</span>{" "}
          <span className="text-dnd-brown">{getAC(monster.ac)}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-dnd-red">Hit Points</span>{" "}
          <span className="text-dnd-brown">{getHP(monster.hp)}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-dnd-red">Speed</span>{" "}
          <span className="text-dnd-brown">{getSpeed(monster.speed)}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-dnd-red">Challenge</span>{" "}
          <span className="text-dnd-brown">{getCR(monster.cr)}</span>
        </p>
      </div>

      {/* Ability scores */}
      {ABILITY_NAMES.every((a) => monster[a] !== undefined) && (
        <div className="grid grid-cols-6 gap-1 text-center border-b border-dnd-red/30 pb-2 mb-2">
          {ABILITY_NAMES.map((ability, i) => (
            <div key={ability} className="ability-score">
              <div className="text-dnd-red text-xs font-bold uppercase">{ABILITY_LABELS[i]}</div>
              <div className="score text-sm font-bold text-dnd-brown">{monster[ability]}</div>
              <div className="modifier text-xs text-dnd-red/80">{modifier(monster[ability])}</div>
            </div>
          ))}
        </div>
      )}

      {/* Source */}
      <p className="text-dnd-brown/50 text-xs italic text-right mt-2">
        Source: {monster.source}{monster.page ? `, p.${monster.page}` : ""}
      </p>
    </div>
  );
}

export default MonsterDisplay;
