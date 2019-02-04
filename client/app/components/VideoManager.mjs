import React, { useState, useEffect } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import Modal from 'react-modal';
import flowRight from 'lodash/fp/flowRight';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import Player from './Player.mjs';
import useToggle from '../lib/useToggle.js';
import config from '../../../config/client.json';

const Map = flowRight(
  withScriptjs,
  withGoogleMap
)(() => (
  <GoogleMap
    defaultZoom={14}
    defaultCenter={{ lat: 37.68, lng: -97.33 }}
    options={{ mapTypeControl: false, zoomControl: false, streetViewControl: false }}
  />
));

const VideoManager = ({ loading, data }) => {
  const [videos, setVideos] = useState([]);
  useEffect(
    () => {
      if (isEmpty(videos) && data && data.videos) setVideos(data.videos);
    },
    [data]
  );

  const setVideoAtIndex = (index, video) => {
    setVideos(prevVideos => [...prevVideos.slice(0, index), video, ...prevVideos.slice(index + 1)]);
  };

  const { enabled: isShowingPlayer, enable: hidePlayer, disable: showPlayer } = useToggle(true);
  const { enabled: isEditingVideos, enable: editVideos, disable: finishEditingVideos } = useToggle(
    false
  );

  const [selectingVideoIndex, showSelectorForIndex] = useState(null);

  const hideSelector = () => showSelectorForIndex(null);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'grid',
        gridTemplateRows: '40px 1fr',
        gridTemplateColumns: '1fr',
        backgroundColor: 'black',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#333333',
          gridColumnEnd: 'span 3',
        }}
      >
        {/* <button onClick={showPlayer}>map</button>
    <button onClick={hidePlayer}>Sampler</button> */}
        {isEditingVideos ? (
          <button onClick={finishEditingVideos}>Play videos</button>
        ) : (
          <button onClick={editVideos}>Select videos</button>
        )}
      </div>
      <div>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            className="map-container"
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            <Map
              googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${
                config.googleMaps.apiKey
              }&v=3.exp&libraries=geometry,drawing,places`}
              loadingElement={<div style={{ height: '100%' }} />}
              containerElement={<div style={{ height: '100%' }} />}
              mapElement={<div style={{ height: '100%' }} />}
            >
              {/* {!loading &&
            map(({ lat, lng, id }) => {debugger; return <Marker position={{ lat, lng }} key={id} />})(
              data.videos
            )} */}
            </Map>
          </div>
          {isShowingPlayer && !loading && (
            <Player
              videos={videos}
              isEditingVideos={isEditingVideos}
              showSelectorForIndex={showSelectorForIndex}
            />
          )}
          {selectingVideoIndex !== null && (
            <Modal
              isOpen={true}
              onRequestClose={hideSelector}
              style={{
                content: {
                  width: '100%',
                  maxWidth: '600px',
                  height: '100%',
                  maxHeight: '600px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                },
              }}
            >
              <button onClick={hideSelector}>Cancel</button>
              <ul>
                {data.videos &&
                  map(video => (
                    <li>
                      <img
                        width={100}
                        src={`${config.assetPrefix}${video.thumbnailUrl}`}
                        onClick={() => {
                          setVideoAtIndex(selectingVideoIndex, video);
                          hideSelector();
                        }}
                      />
                    </li>
                  ))(data.videos)}
              </ul>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
