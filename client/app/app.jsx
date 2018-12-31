const React = require('react');
const { default: GoogleMapReact } = require('google-map-react');
const config = require('../../config/client.json');

const App = () => (
  <div className="map-container">
    <GoogleMapReact
      bootstrapURLKeys={{ key: config.googleMaps.apiKey }}
      defaultCenter={{ lat: 37.6937518, lng: -97.3775182 }}
      defaultZoom={13}
    />
  </div>
);

module.exports = App;
