import React from "react";

function Search({ setSearch = () => {} }) {
  const handleSearchChange = (event) => {
    let searchString = event.target.value;
    searchString =
      searchString.charAt(0).toUpperCase() + searchString.slice(1);
    setSearch(searchString);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dnd-text/40 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </span>
      <input
        type="search"
        id="query"
        name="q"
        placeholder="Search monsters..."
        onChange={handleSearchChange}
        className="input-dnd pl-9"
      />
    </div>
  );
}

export default Search;
