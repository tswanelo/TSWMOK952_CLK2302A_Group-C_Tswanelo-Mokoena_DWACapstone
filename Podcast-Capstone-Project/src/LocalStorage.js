// LocalStorage.js
// Utility object for interacting with the browser's localStorage

const LocalStorage = {
  // Function to set an item in localStorage
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Function to get an item from localStorage
  getItem: (key) => {
    try {
      // Attempt to parse the stored JSON, return null if not found or parsing fails
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // Log an error if there's an issue parsing the JSON
      console.error('Error parsing JSON from localStorage:', error);
      return null;
    }
  },

  // Function to remove an item from localStorage
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
};

// Export the LocalStorage object for use in other files
export default LocalStorage;
