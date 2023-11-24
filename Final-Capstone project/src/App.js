// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    axios.get('https://podcast-api.netlify.app/shows')
      .then(response => {
        setShows(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      <h1>Podcasts</h1>
      {shows.map(show => (
        <div key={show.id}>
          <h2>{show.title}</h2>
          <p>Genre: {show.GENRE ? show.GENRE.join(', ') : 'N/A'}</p>
          <Seasons seasons={show.SEASONS} />
        </div>
      ))}
    </div>
  );
};

const Seasons = ({ seasons }) => {
  return (
    <div>
      <h3>Seasons</h3>
      {seasons.map(season => (
        <div key={season.id}>
          <h4>{season.title}</h4>
          <Episodes episodes={season.EPISODES} />
        </div>
      ))}
    </div>
  );
};

const Episodes = ({ episodes }) => {
  return (
    <div>
      <h5>Episodes</h5>
      {episodes.map(episode => (
        <div key={episode.id}>
          <p>{episode.title}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
