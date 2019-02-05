import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import Modal from 'react-modal';
import flowRight from 'lodash/fp/flowRight';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import Player from './Player.mjs';
import useToggle from '../lib/useToggle.js';
import styles from '../styles.mjs';
import config from '../../../config/client.json';
import { Button } from '../styleguide.mjs';

const headerHeight = '40px';

const HeaderButton = props => (
  <Button
    css={{
      display: 'inline-block',
      height: headerHeight,
      lineHeight: headerHeight,
      backgroundColor: 'transparent',
      border: 0,
      color: styles.textColor,
      textDecoration: 'underline',
      float: 'left',
    }}
    {...props}
  />
);

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

const Title = props => (
  <h1
    css={{
      display: 'inline-block',
      fontSize: 24,
      lineHeight: headerHeight,
      color: styles.textColor,
      margin: '0 20px 0 5px',
      float: 'left',
    }}
    {...props}
  />
);

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

  // eslint-disable-next-line no-unused-vars
  const { enabled: isShowingPlayer, enable: hidePlayer, disable: showPlayer } = useToggle(true);
  const { enabled: isEditingVideos, enable: editVideos, disable: finishEditingVideos } = useToggle(
    false
  );

  const [selectingVideoIndex, showSelectorForIndex] = useState(null);

  const hideSelector = () => showSelectorForIndex(null);

  return (
    <div
      css={{
        height: '100%',
        width: '100%',
        display: 'grid',
        gridTemplateRows: `${headerHeight} 1fr`,
        gridTemplateColumns: '1fr',
        backgroundColor: 'black',
      }}
    >
      <div
        css={{
          width: '100%',
          height: '100%',
          backgroundColor: '#333333',
          gridColumnEnd: 'span 3',
        }}
      >
        {/* <Button onClick={showPlayer}>map</Button>
    <Button onClick={hidePlayer}>Sampler</Button> */}
        <Title>MapMusik</Title>
        {isEditingVideos ? (
          <HeaderButton onClick={finishEditingVideos}>ready to play!</HeaderButton>
        ) : (
          <HeaderButton onClick={editVideos}>change videos</HeaderButton>
        )}
      </div>
      <div>
        <div css={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            className="map-container"
            css={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            <Map
              googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${
                config.googleMaps.apiKey
              }&v=3.exp&libraries=geometry,drawing,places`}
              loadingElement={<div css={{ height: '100%' }} />}
              containerElement={<div css={{ height: '100%' }} />}
              mapElement={<div css={{ height: '100%' }} />}
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
                  backgroundColor: styles.backgroundColor,
                  border: `1px solid ${styles.borderColor}`,
                  borderRadius: '5px',
                  transform: 'translate(-50%,-50%)',
                },
              }}
            >
              <Button onClick={hideSelector}>Cancel</Button>
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

VideoManager.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    video: PropTypes.arrayOf(PropTypes.object).isRequired,
  }),
};

export default VideoManager;
