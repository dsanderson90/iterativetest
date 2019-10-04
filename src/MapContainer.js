import React, { Component } from 'react';
import { GoogleApiWrapper } from 'google-maps-react';
import Trip from './Trip';

import TripsTable from './TripsTable';
const APIKEY = `${process.env.REACT_APP_API_KEY}`;

export class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: '',
      destination: '',
      travelMode: 'DRIVING',
      distance: null,
      duration: null,
      options: ['DRIVING', 'WALKING', 'TRANSIT', 'BICYCLING'],
      error: false,
    };
  }

  createTrip(distance, duration, origin, destination) {
    const { travelMode } = this.state;
    const trip = {
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      distance: distance,
      duration: duration,
    };
    return fetch('http://localhost:3001/api/trips', {
      method: 'post',
      body: JSON.stringify(trip),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(this.checkStatus);
  }

  calculateDistance = () => {
    const { google } = this.props;
    const { origin, destination, travelMode } = this.state;
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: travelMode,
      },
      (res, status) => {
        if (status === 'OK') {
          let distance = res.rows[0].elements[0].distance.text;
          let duration = res.rows[0].elements[0].duration.text;
          let originAddress = res.originAddresses.toString();
          let destinationAddress = res.destinationAddresses.toString();
          this.setState({
            distance: distance,
            duration: duration,
          });
          this.createTrip(
            distance,
            duration,
            originAddress,
            destinationAddress
          );
        } else {
          console.log(status);
          this.setState({
            error: true,
          });
        }
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    this.calculateDistance();
  };

  handleChange = e => {
    const { name, value } = e;
    if (name === 'travelMode') {
      e.preventDefault();
      this.setState({
        travelMode: value,
      });
    }
    this.setState({
      [name]: value,
    });
  };

  render() {
    const { error } = this.state;
    const { data } = this.props;
    if (error) {
      return (
        <div>
          <h1>Error Communicating with the server</h1>
        </div>
      );
    }

    const travelModeButtons = this.state.options.map((option, i) => (
      <button
        key={i}
        onClick={this.handleChange}
        value={option}
        name="travelMode"
      >
        {option}
      </button>
    ));

    let trips = data.map((trip, i) => (
      <Trip
        key={i}
        destination={trip.destination}
        origin={trip.origin}
        travelMode={
          trip.travelMode === 'DRIVING'
            ? '🚗'
            : trip.travelMode === 'WALKING'
            ? '🚶🏻‍♂️'
            : trip.travelMode === 'TRANSIT'
            ? '🚎'
            : '🚲'
        }
        distance={trip.distance}
        duration={trip.duration}
      />
    ));
    return (
      <div>
        <TripsTable trips={trips} />

        <form onSubmit={this.handleSubmit}>
          <h1>Origin</h1>
          <label>Enter Origin Address</label>
          <input
            type="text"
            name="origin"
            value={this.state.origin}
            onChange={this.handleChange}
            required
          />

          <h1>Destination</h1>
          <label>Enter Destination Address</label>
          <input
            type="text"
            name="destination"
            value={this.state.destination}
            onChange={this.handleChange}
            required
          />

          <h1>Travel Mode</h1>
          <label>Select Mode of Transportation</label>
          {travelModeButtons}
          <div>
            <input type="submit" value="submit" />
          </div>
        </form>
      </div>
    );
  }
}
export default GoogleApiWrapper({
  apiKey: APIKEY,
})(MapContainer);
