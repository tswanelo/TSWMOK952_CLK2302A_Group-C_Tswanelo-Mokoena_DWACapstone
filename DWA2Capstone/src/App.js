// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const App = () => {
  // State variables
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [favoriteEpisodes, setFavoriteEpisodes] = useState({});
  const [sortOption, setSortOption] = useState('default');
  const [filterText, setFilterText] = useState('');
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [userProgress, setUserProgress] = useState({});
  


  // Genre titles mapping
  const genreTitles = {
    1: 'Personal Growth',
    2: 'True Crime and Investigative Journalism',
    3: 'History',
    4: 'Comedy',
    5: 'Entertainment',
    6: 'Business',
    7: 'Fiction',
    8: 'News',
    9: 'Kids and Family',
  };

  // Function to filter shows by genre
  const filterByGenre = (genre) => {
    setFilterText(genreTitles[genre].toLowerCase());
  };

  // Fetch shows and their additional data on component mount
  useEffect(() => {
    const fetchShows = async () => {
      try {
        // Fetch shows data from the API
        const response = await fetch('https://podcast-api.netlify.app/shows');
        const data = await response.json();

        // Process shows data and add additional information
        const showsWithAdditionalData = await Promise.all(
          data.map(async (show) => {
            const imageResponse = await fetch(show.imageData);
            const imageData = await imageResponse.blob();
            const imageURL = URL.createObjectURL(imageData);

            const seasonResponse = await fetch(`https://podcast-api.netlify.app/shows/${show.id}/seasons`);
            const seasonData = await seasonResponse.json();

            const lastUpdatedDate = new Date(show.updated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return {
              ...show,
              previewImageURL: imageURL,
              seasonsCount: seasonData.length,
              lastUpdatedDate,
            };
          })
        );

        // Update state with the processed shows data
        setShows(showsWithAdditionalData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shows:', error);
        setLoading(false);
      }
    };

    // Call the fetchShows function on component mount
    fetchShows();
  }, []);

  // Fetch episodes for a given show and season
  const fetchEpisodes = async (showId, seasonNumber, file) => {
    try {
      // Fetch episodes data from the API
      const response = await fetch(`https://podcast-api.netlify.app/shows/${showId}/seasons/${seasonNumber}/episodes/${file}`);
      const data = await response.json();
      setSeasonEpisodes(data);

      // Set the selected season
      setSelectedSeason(seasonNumber);

      // Check if the user has progress for this show and season
      const showSeasonKey = `${showId}_${seasonNumber}`;
      if (userProgress[showSeasonKey]) {
        const { episodeId, progress } = userProgress[showSeasonKey];
        const resumedEpisode = data.find((episode) => episode.id === episodeId);
        setCurrentEpisode(resumedEpisode);
        setAudioProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  // Add an episode to the favorites with timestamp
  const addToFavorites = (episode, showId) => {
    setFavoriteEpisodes((prevFavorites) => {
      const newFavorites = { ...prevFavorites };

      if (!newFavorites[showId]) {
        newFavorites[showId] = [];
      }

      const timestamp = new Date().toLocaleString(); // Current date and time
      newFavorites[showId].push({ ...episode, timestamp });

      return newFavorites;
    });
  };

  // Remove an episode from the favorites
  const removeFromFavorites = (episode, showId) => {
    setFavoriteEpisodes((prevFavorites) => {
      const newFavorites = { ...prevFavorites };

      if (newFavorites[showId]) {
        newFavorites[showId] = newFavorites[showId].filter(
          (favEpisode) => favEpisode.id !== episode.id
        );

        if (newFavorites[showId].length === 0) {
          delete newFavorites[showId];
        }
      }

      return newFavorites;
    });
  };

  // Sort favorites based on the selected option
  const sortFavorites = (option) => {
    setFavoriteEpisodes((prevFavorites) => {
      const newFavorites = { ...prevFavorites };

      Object.keys(newFavorites).forEach((showId) => {
        switch (option) {
          case 'titleAZ':
            newFavorites[showId].sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'titleZA':
            newFavorites[showId].sort((a, b) => b.title.localeCompare(a.title));
            break;
          case 'dateAsc':
            newFavorites[showId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
          case 'dateDesc':
            newFavorites[showId].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
          default:
            // 'default': do nothing
            break;
        }
      });

      return newFavorites;
    });
  };

  // Sort shows based on the selected option
  const sortShows = (option) => {
    let sortedShows = [...shows];

    switch (option) {
      case 'titleAZ':
        sortedShows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'titleZA':
        sortedShows.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'dateAsc':
        sortedShows.sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      case 'dateDesc':
        sortedShows.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      default:
        // 'default': do nothing
        break;
    }

    setShows(sortedShows);
  };

  // Handle sorting option changes
  const handleSortChange = (option) => {
    setSortOption(option);

    if (option === 'favorites') {
      setSelectedSeason('favorites');
      sortFavorites(option);
    } else {
      sortShows(option);
    }
  };

  // Handle filter text changes
  const handleFilterTextChange = (newText) => {
    setFilterText(newText);
  };

  // Function to update audio progress
  const updateAudioProgress = (progress) => {
    setAudioProgress(progress);
  };

  // Function to handle the "reset" button click
  const resetProgress = () => {
    setUserProgress({});
    setAudioProgress(0);
    setCurrentEpisode(null);
  };

  const playEpisode = (episode) => {
    setCurrentEpisode(episode);

    // Assuming you have an audio player component with play method
    const audioPlayer = new Audio(`https://podcast-api.netlify.app/placeholder-audio.mp3`);
    audioPlayer.play();

    // Additional logic to update progress
    audioPlayer.addEventListener('timeupdate', () => {
      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      updateAudioProgress(progress);
    });

    // Additional logic to handle the end of the episode
    audioPlayer.addEventListener('ended', () => {
      // Update user progress when the episode finishes
      updateProgressOnEpisodeCompletion(episode);
      setCurrentEpisode(null);
      setAudioProgress(0);
    });
  };

  // Additional function to update user progress on episode completion
  const updateProgressOnEpisodeCompletion = (episode) => {
    const showSeasonKey = `${episode.id}_${episode.seasonNumber}`;
    setUserProgress((prevUserProgress) => {
      return {
        ...prevUserProgress,
        [showSeasonKey]: {
          episodeId: episode.id,
          progress: 0, // Reset progress on episode completion
        },
      };
    });
  };

  // JSX rendering
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '70%', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', color: '#d7d9e3', borderRadius: '2px' }}>
          Sort By:
          <select
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="default">Default</option>
            <option value="titleAZ">Title (A-Z)</option>
            <option value="titleZA">Title (Z-A)</option>
            <option value="dateAsc">Date Updated (Asc)</option>
            <option value="dateDesc">Date Updated (Desc)</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', color: '#d7d9e3' }}>
          Filter by Title:
          <input
            type="text"
            value={filterText}
            onChange={(e) => handleFilterTextChange(e.target.value)}
            style={{
              marginLeft: '10px',
              padding: '5px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {Object.keys(genreTitles).map((genreId) => (
          <button
            key={genreId}
            onClick={() => filterByGenre(genreId)}
            style={{
              marginRight: '10px',
              marginBottom: '10px',
              fontWeight: 'bold',
              padding: '15px',
              cursor: 'pointer',
              backgroundColor: '#21222A',
              color: '#61DAFB',
              border: 'none',
              borderRadius: '18px',
            }}
          >
            {genreTitles[genreId]}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="app-container"> 
          {shows
            .filter(
              (show) =>
                show.title.toLowerCase().includes(filterText) ||
                (show.genres && show.genres.includes(parseInt(filterText)))
            )
            .map((show) => (
              <div
                key={show.id}
                style={{
                  marginBottom: '30px',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '20px',
                }}
              >
                <img src={show.image} alt={show.title} className="img--show" />
                <h2>{show.title}</h2>
                <p style={{ fontWeight: 'bold', color: '#ced0dc' }}>{`Seasons: ${show.seasons}`}</p>
                <p>{`Last Updated: ${show.updated}`}</p>
                <p>{`Genres: ${
                  show.genres ? show.genres.map((genreId) => genreTitles[genreId]).join(', ') : 'N/A'
                }`}</p>

                <button
                  onClick={() => {
                    
                    fetchEpisodes(selectedSeason);
                  }}
                >
                  View Seasons
                </button>

                {currentEpisode && currentEpisode.id === show.id && (
                  <div>
                    <p>{`Currently playing: ${currentEpisode.title}`}</p>
                    <p>{`Progress: ${audioProgress}%`}</p>
                  </div>
                )}
                <div style={{backgroundColor: '#61DAFB',borderRadius:'12px'}}>
                <button onClick={() => playEpisode(currentEpisode)}>Play</button>
                <button onClick={() => playEpisode()}>Pause</button>
                </div>
              </div>
            ))}
        </div>
      )}

      <button onClick={() => setSelectedSeason('favorites')}>View Favorites</button>

      {selectedSeason === 'favorites' && (
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Favorites</h1>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px' }}>
              Sort By:
              <select
                onChange={(e) => sortFavorites(e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                <option value="titleAZ">Title (A-Z)</option>
                <option value="titleZA">Title (Z-A)</option>
                <option value="dateAsc">Date Added (Asc)</option>
                <option value="dateDesc">Date Added (Desc)</option>
              </select>
            </label>
          </div>
          {Object.keys(favoriteEpisodes).length > 0 ? (
            Object.entries(favoriteEpisodes).map(([showId, episodes]) => (
              <div key={showId} style={{ marginBottom: '30px' }}>
                <h2>{`Show ID: ${showId}`}</h2>
                {episodes.map((episode) => (
                  <div key={episode.id}>
                    <p>{`Season: ${episode.seasons}`}</p>
                    <p>{`Title: ${episode.title}`}</p>
                    <p>{`Date Added: ${episode.updated}`}</p>
                    <button onClick={() => removeFromFavorites(episode, showId)}>
                      Remove from Favorites
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p style={{ fontStyle: 'italic', color: '#888' }}>No favorite episodes yet.</p>
          )}
        </div>
      )}

      <button
        onClick={resetProgress}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '10px 15px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '20px',
        }}
      >
        Reset All Progress
      </button>
    </div>
  );
};

export default App;
