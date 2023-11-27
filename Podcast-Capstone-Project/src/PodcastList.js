// PodcastList.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import PodcastControls from './PodcastControls';
import AudioPlayer from './AudioPlayer';

// PodcastList component to display a list of podcasts with controls
const PodcastList = () => {
  // State variables to manage podcast data, player state, and loading/error states
  const [previews, setPreviews] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [filterTitle, setFilterTitle] = useState('');
  const [filteredPreviews, setFilteredPreviews] = useState([]);
  const [lastListened, setLastListened] = useState(
    JSON.parse(localStorage.getItem('lastListened')) || null
  );
  const [listeningHistory, setListeningHistory] = useState(
    JSON.parse(localStorage.getItem('listeningHistory')) || {}
  );

  // Function to fetch data from a given URL and handle errors
  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      setError(`Error: ${error.message}`);
      throw error;
    }
  };

  // Effect hook to fetch podcast previews when the component mounts
  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        const data = await fetchData('https://podcast-api.netlify.app/shows');
        setPreviews(data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching previews. Please try again later.');
        setLoading(false);
      }
    };

    fetchPreviews();
  }, []);

  // Effect hook to filter and sort previews based on user selections
  useEffect(() => {
    let filteredShows = previews.filter((preview) =>
      preview.title.toLowerCase().includes(filterTitle.toLowerCase())
    );

    if (sortBy === 'titleAsc') {
      filteredShows.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'titleDesc') {
      filteredShows.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'dateAsc') {
      filteredShows.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
    } else if (sortBy === 'dateDesc') {
      filteredShows.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }

    setFilteredPreviews(filteredShows);
  }, [previews, sortBy, filterTitle]);

  // Function to handle clicking on a podcast show to display details
  const handleShowClick = async (showId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchData(`https://podcast-api.netlify.app/id/${showId}`);
      setSelectedShow(data);
      setSelectedSeason(data.seasons[0]); // Select the first season by default
      setLoading(false);
    } catch (error) {
      setError(`Error fetching show ${showId}. Please try again later.`);
      setLoading(false);
    }
  };

  // Function to toggle play/pause of the audio player
  const playPauseToggle = () => {
    const audioElement = document.getElementById('audio');
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Effect hook to handle the end of audio playback and update last listened
  useEffect(() => {
    const audioElement = document.getElementById('audio');

    const handleEnded = () => {
      setLastListened({
        show: 'Your Show',
        episode: 'Episode Name',
        timestamp: audioElement.currentTime,
      });
    };

    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [setLastListened]);

  // Effect hook to update localStorage when lastListened changes
  useEffect(() => {
    localStorage.setItem('lastListened', JSON.stringify(lastListened));
  }, [lastListened]);

  // Function to handle sorting podcasts by title
  const handleTitleSort = (order) => {
    setSortBy(`title${order}`);
  };

  // Function to handle sorting podcasts by date
  const handleDateSort = (order) => {
    setSortBy(`date${order}`);
  };

  // Function to handle filtering podcasts by title
  const handleTitleFilter = (value) => {
    setFilterTitle(value);
  };

  // Function to handle filtering podcasts by genre
  const handleGenreFilter = (genre) => {
    let filteredShows = previews.filter((preview) => preview.genres.includes(genre));
    setFilteredPreviews(filteredShows);
  };

  // Function to handle selecting an episode and updating listening history
  const handleEpisodeSelect = (episode) => {
    setLastListened({
      showId: selectedShow.id,
      episodeId: episode.id,
      timestamp: listeningHistory[episode.id] || 0,
    });

    addFavorite({
      id: episode.id,
      title: episode.title,
      showTitle: selectedShow.title,
      seasonTitle: selectedSeason.title,
      addedDate: new Date(),
    });

    setListeningHistory((prevHistory) => ({
      ...prevHistory,
      [episode.id]: listeningHistory[episode.id] || 0,
    }));
  };

  // Function to add an episode to favorites
  const addFavorite = (episode) => {
    setFavorites((prevFavorites) => [...prevFavorites, episode]);
  };

  // Function to remove an episode from favorites
  const removeFavorite = (episodeId) => {
    setFavorites((prevFavorites) => prevFavorites.filter((episode) => episode.id !== episodeId));
  };

  // Function to get unique genres from previews
  const getGenres = () => {
    return Array.from(new Set(previews.flatMap((preview) => preview.genres)));
  };

  // Function to reset progress, including last listened and listening history
  const resetProgress = () => {
    setLastListened({});
    setListeningHistory({});
    localStorage.removeItem('lastListened');
    localStorage.removeItem('listeningHistory');
  };

  // Render the PodcastList component
  return (
    <section className="podcast-list-container">
      {/* PodcastControls component for sorting and filtering */}
      <PodcastControls
        onTitleSort={handleTitleSort}
        onDateSort={handleDateSort}
        onTitleFilter={handleTitleFilter}
        onGenreFilter={handleGenreFilter}
        genres={getGenres()}
      />

      {/* Loading and error messages */}
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {/* Slider component for displaying podcast previews */}
      <Slider className="preview-list" slidesToShow={3} infinite>
        {filteredPreviews.map((preview) => (
          <div key={preview.id} onClick={() => handleShowClick(preview.id)}>
            <div className="show-preview">
              <img src={preview.image} alt={`${preview.title} Preview`} />
              <div className="show-info">
                <h3 style={{color:'#61DAFB'}}>{preview.title}</h3>
                <p>{`Seasons: ${preview.seasons}`}</p>
                <p>{`Last Updated: ${new Date(preview.updated).toLocaleDateString()}`}</p>
                <p>{`Genres: ${preview.genres.join(', ')}`}</p>
                {/* Audio player */}
                <audio id="audio" src="https://podcast-api.netlify.app/placeholder-audio.mp3" />
                {/* Button for play/pause toggle */}
                <button onClick={playPauseToggle}>
                  {isPlaying ? (
                    <img src="./pause (1).png" alt="Pause" className="icon--pause" />
                  ) : (
                    <img src="./play (1).png" alt="Play" className="icon--play" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Details section for selected show and season */}
      {selectedShow && (
        <div className="show-details">
          <h2>{selectedShow.title}</h2>
          <p>{selectedShow.description}</p>

          {selectedSeason ? (
            <div className="season-details">
              {/* Button to go back to the show details */}
              <button onClick={() => setSelectedSeason(null)}>Back to Show</button>
              <h3 style={{color:'white'}}>{selectedSeason.title}</h3>
              <p>{`Episodes: ${selectedSeason.episodes.length}`}</p>
              <img src={selectedSeason.image} alt={`${selectedSeason.title} Season Preview`} style={{color:'white'}}/>
              {/* List of episodes in the selected season */}
              <ul className="episode-list">
                {selectedSeason.episodes.map((episode) => (
                  <li key={episode.id}>
                    {episode.title}
                    {/* Button to view the episode details */}
                    <button onClick={() => handleEpisodeSelect(episode)}>View Episode</button>
                    {/* Button to add the episode to favorites */}
                    <button onClick={() => addFavorite(episode)}>Add to Favorites</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3>Seasons</h3>
              {/* List of seasons for the selected show */}
              <ul className="season-list">
                {selectedShow.seasons.map((season) => (
                  <li key={season.id} onClick={() => setSelectedSeason(season)}>
                    {season.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Display favorites section if there are favorites */}
      {favorites.length > 0 && (
        <div className="favorites-container">
          <h2>Your Favorites</h2>
          {/* List of favorite episodes */}
          {favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-item">
              <p style={{color:'white'}}>{favorite.title}</p>
              <p>{`Show: ${favorite.showTitle}`}</p>
              <p>{`Season: ${favorite.seasonTitle}`}</p>
              {/* Button to remove the episode from favorites */}
              <button onClick={() => removeFavorite(favorite.id)}>Remove from Favorites</button>
            </div>
          ))}
        </div>
      )}

      {/* AudioPlayer component for controlling audio playback */}
      <AudioPlayer />
    </section>
  );
};

// Export the PodcastList component for use in other files
export default PodcastList;
