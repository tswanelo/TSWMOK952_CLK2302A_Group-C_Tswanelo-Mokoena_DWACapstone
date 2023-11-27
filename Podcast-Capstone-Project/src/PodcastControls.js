// PodcastControls.js
import React from 'react';

// PodcastControls component to handle sorting and filtering of podcasts
const PodcastControls = ({
  onTitleSort,
  onDateSort,
  onTitleFilter,
  onGenreFilter,
}) => {
  // Genre ID to Title mapping
  const genres = [
    { id: 0, title: 'All' }, 
    { id: 1, title: 'Personal Growth' },
    { id: 2, title: 'True Crime and Investigative Journalism' },
    { id: 3, title: 'History' },
    { id: 4, title: 'Comedy' },
    { id: 5, title: 'Entertainment' },
    { id: 6, title: 'Business' },
    { id: 7, title: 'Fiction' },
    { id: 8, title: 'News' },
    { id: 9, title: 'Kids and Family' },
  ];

  // Function to handle genre filtering
  const handleGenreFilter = (id) => {
    // Check if the selected genre is "All"
    if (id === 0) {
      // Call the onGenreFilter function with no specific genre (show all)
      onGenreFilter(null);
    } else {
      // Call the onGenreFilter function with the selected genre
      onGenreFilter(id);
    }
  };

  // Render the PodcastControls component
  return (
    <div className="filter-sort-container">
      {/* Input for filtering podcasts by title */}
      <input
        type="text"
        placeholder="Filter by title..."
        onChange={(e) => onTitleFilter(e.target.value)}
      />
      {/* Buttons for sorting podcasts */}
      <button onClick={() => onTitleSort('Asc')}>Sort A-Z</button>
      <button onClick={() => onTitleSort('Desc')}>Sort Z-A</button>
      <button onClick={() => onDateSort('Asc')}>Sort by Date Asc</button>
      <button onClick={() => onDateSort('Desc')}>Sort by Date Desc</button>

      {/* Container for displaying genres */}
      <div className="genres-container">
        <h3 style={{color:'white', fontWeight:'bold'}}>Genres</h3>
        {/* List of genres with click event to handle filtering */}
        <ul className="genre-list">
          {genres.map((genre) => (
            <li key={genre.id} onClick={() => handleGenreFilter(genre.id)}>
              {genre.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Export the PodcastControls component for use in other files
export default PodcastControls;
