// Favorites.js
import React, { useState } from 'react';
import './App.css'; // Import the CSS file for styling

// Favorites component to display a list of favorites and provide actions for each
const Favorites = ({ favorites, onRemoveFavorite, onSelectEpisode }) => {
  // State to track the selected favorite and modal state
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal with details of a selected favorite
  const openModal = (favorite) => {
    setSelectedFavorite(favorite);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedFavorite(null);
    setIsModalOpen(false);
  };

  // Render the favorites component
  return (
    <div className="favorites-container">
      <h2>Favorites</h2>
      {favorites.length === 0 ? (
        // Display a message if there are no favorites
        <p>No favorites added yet.</p>
      ) : (
        // Display the list of favorites
        <ul className="favorites-list">
          {favorites.map((favorite) => (
            // Render each favorite as a list item
            <li key={favorite.id}>
              <p>{`${favorite.show} - ${favorite.season}`}</p>
              {/* Button to view the episode details */}
              <button onClick={() => onSelectEpisode(favorite)}>View Episode</button>
              {/* Button to remove the favorite */}
              <button onClick={() => onRemoveFavorite(favorite)}>Remove from Favorites</button>
              {/* Button to view the season and episodes details in a modal */}
              <button onClick={() => openModal(favorite)}>View Season and Episodes</button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal section: Display modal if it's open and a favorite is selected */}
      {isModalOpen && selectedFavorite && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Button to close the modal */}
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {/* Display the title of the selected favorite */}
            <h2>{`${selectedFavorite.show} - ${selectedFavorite.season}`}</h2>
            {/* Display the list of episodes for the selected favorite */}
            <ul className="episode-list">
              {selectedFavorite.episodes.map((episode) => (
                // Render each episode as a list item
                <li key={episode.id}>
                  {episode.title}
                  {/* Button to view the episode details */}
                  <button onClick={() => onSelectEpisode(episode)}>View Episode</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
