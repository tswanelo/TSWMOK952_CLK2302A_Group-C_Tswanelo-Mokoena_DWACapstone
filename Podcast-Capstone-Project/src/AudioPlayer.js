import React, { useState, useEffect } from 'react';
import './App.css';
import LocalStorage from './LocalStorage';

const AudioPlayer = () => {
  // State variables to manage the audio player's state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // State to store the last listened information retrieved from local storage
  const [lastListened, setLastListened] = useState(
    LocalStorage.getItem('lastListened') || {}
  );

  // Function to toggle play/pause of the audio player
  const playPauseToggle = () => {
    const audioElement = document.getElementById('audio');
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Effect hook to set up event listeners for time updates and playback end
  useEffect(() => {
    const audioElement = document.getElementById('audio');

    if (audioElement) {
      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
        setDuration(audioElement.duration);
      };

      const handleEnded = () => {
        // Save the last listened information when playback ends
        setLastListened({
          show: 'Your Show',
          episode: 'Episode Name',
          timestamp: audioElement.currentTime,
        });
      };

      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('ended', handleEnded);

      // Cleanup event listeners on component unmount
      return () => {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []); // Empty dependency array ensures that this effect runs only once during component mount

  // Effect hook to update local storage when lastListened changes
  useEffect(() => {
    localStorage.setItem('lastListened', JSON.stringify(lastListened));
  }, [lastListened]);

  // Function to reset the playback progress
  const resetProgress = () => {
    localStorage.removeItem('lastListened');
    setLastListened({});
  };

  // Function to format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Render the audio player component
  return (
    <div className="music-player-container">
      <img
        className="cover-image"
        src="https://lh3.googleusercontent.com/_hIJWZ8fVPbZmkkROVzZQCj0eUcrh-LZPjOhdmfX8mmCIJnoWkq7RRZxryLzeKi0m5E"
        alt="Album Cover"
      />
      <div className="music-player">
        <h1 style={{color:'#61DAFB'}}>Audio Player</h1>
        <audio id="audio" src="https://podcast-api.netlify.app/placeholder-audio.mp3" />
        <div>
          <p>Current Time: {formatTime(currentTime)}</p>
          <p>Duration: {formatTime(duration)}</p>
        </div>
        <button onClick={playPauseToggle}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={resetProgress}>
          Reset Progress
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
