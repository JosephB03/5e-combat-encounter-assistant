import React, { useState } from "react";

function MonsterTable({ begin, monsters, handleAdd }) {
  // Dynamically update using JSON

  const sizes = {
    T: "Tiny",
    S: "Small",
    M: "Medium",
    L: "Large",
    H: "Huge",
    G: "Gargantuan",
  };


  return (
    <table>
      <thead>
        <tr>
          <th>Add</th>
          <th>Name</th>
          <th>Size</th>
          <th>Type</th>
          <th>Challenge Rating</th>
        </tr>
      </thead>
      <tbody>
        {monsters.slice(begin, begin + 10).map((monster, index) => (
          <tr key={index}>
            <td><button onClick={() => handleAdd(monster)}>Add</button></td>
            <td>{monster.name} <small>{monster.source}</small></td>
            <td>{sizes[monster.size]}</td>
            <td>
              {typeof monster.type === "object"
                ? monster.type.type
                : monster.type}
            </td>
            <td>
              {typeof monster.cr === "object" ? monster.cr.cr : monster.cr}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

MonsterTable.defaultProps = {
  begin: 0,
  search: "",
};

export default MonsterTable;
