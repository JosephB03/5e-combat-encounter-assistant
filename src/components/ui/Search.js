import React, { useState } from "react";

function Search(props) {
  let handleSearchChange = (event) => {
    let searchString = event.target.value;
    searchString = searchString.charAt(0).toUpperCase() + searchString.slice(1);
    props.setSearch(searchString);
  };

  return (
    <input
      type="search"
      id="query"
      name="q"
      placeholder="Search..."
      onChange={handleSearchChange}
    />
  );
}

Search.defaultProps = {
  setSearch: () => {},
};

export default Search;
