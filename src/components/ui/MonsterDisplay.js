import React, { useState, useEffect } from "react";
import { storage } from "../other/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

function MonsterDisplay({ monster }) {
  const [imgURL, setImgURL] = useState("");

  useEffect(() => {
    console.log(monster.name);
    if (monster.name !== "None") {
      console.log("useEffect caught encounter change");
      let newRef = ref(
        storage,
        "bestiary-imgs/" + monster.source + "/" + monster.name + ".webp"
      );
      getDownloadURL(newRef)
        .then((url) => {
          const xhr = new XMLHttpRequest();
          xhr.responseType = "blob";
          xhr.onload = (event) => {
            const blob = xhr.response;
          };
          xhr.open("GET", url);
          xhr.send();
          setImgURL(url);
        })
        .catch((error) => {
          console.log("Download error: " + error);
          setImgURL("");
        });
    }
  }, [monster]);

  return (
    <>
      {monster.name === "None" ? (
        <p>No image selected</p>
      ) : imgURL === "" ? (
        <p>Image not found</p>
      ) : (
        <img src={imgURL} alt={"Image of " + monster.name} />
      )}
    </>
  );
}

export default MonsterDisplay;
