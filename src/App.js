import React from 'react';
import MapContainer from './components/MapContainer'
import './App.css'
const App = () => {
  const checkStatus = (response) => {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      console.log(error);
      throw error;
    }
  }

  return (
    <div className="App">
      <MapContainer checkStatus={checkStatus}/>
    </div>
  );
  }

export default App;
