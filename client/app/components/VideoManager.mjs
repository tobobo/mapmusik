import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps';
import Modal from 'react-modal';
import flowRight from 'lodash/fp/flowRight';
import isEmpty from 'lodash/fp/isEmpty';
import map from 'lodash/fp/map';
import range from 'lodash/fp/range';
import format from 'date-fns/fp/format';
import Player from './Player.mjs';
import useToggle from '../lib/useToggle.js';
import styles from '../styles.mjs';
import config from '../../../config/client.js';
import { Button, HeaderButton } from '../styleguide.mjs';

const headerHeight = '40px';

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

const ImagePreview = ({ thumbnailUrl }) => (
  <div
    css={{
      height: '100%',
      width: '100%',
      backgroundImage: `url(${config.assetPrefix}${thumbnailUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />
);

ImagePreview.propTypes = {
  thumbnailUrl: PropTypes.string.isRequired,
};

const PreviewButton = ({ video: { thumbnailUrl, previewUrl } }) => {
  const { enabled: isPreviewDisplayed, enable: displayPreview, disable: hidePreview } = useToggle(
    false
  );
  if (previewUrl && isPreviewDisplayed)
    return (
      <div
        css={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <video
          autoPlay={true}
          controls={true}
          loop
          src={`${config.assetPrefix}${previewUrl}`}
          css={{
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            objectFit: 'cover',
            overflow: 'hidden',
          }}
        />
      </div>
    );
  if (!previewUrl) return <ImagePreview thumbnailUrl={thumbnailUrl} />;

  return (
    <div
      css={{ width: '100%', height: '100%', position: 'relative' }}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        displayPreview();
      }}
    >
      <ImagePreview thumbnailUrl={thumbnailUrl} />
      <div
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          fontSize: 40,
          lineHeight: '100px',
        }}
      >
        ▶
      </div>
    </div>
  );
};

PreviewButton.propTypes = {
  video: PropTypes.shape({
    thumbnailUrl: PropTypes.string.isRequired,
    previewUrl: PropTypes.string,
  }).isRequired,
};

const VideoManager = ({ loading, data }) => {
  const [videos, setVideos] = useState([]);
  const [swappingVideo, setSwappingVideo] = useState(null);
  useEffect(
    () => {
      if (isEmpty(videos) && data && data.featuredVideos)
        setVideos(map(i => data.featuredVideos[i])(range(0, 12)));
    },
    [data]
  );

  const swapVideo = (index, video) => {
    setVideos(prevVideos => [...prevVideos.slice(0, index), video, ...prevVideos.slice(index + 1)]);
    setSwappingVideo(null);
  };

  // eslint-disable-next-line no-unused-vars
  const { enabled: isShowingPlayer, enable: hidePlayer, disable: showPlayer } = useToggle(true);
  const { enabled: isSelectingVideos, enable: showSelector, disable: hideSelector } = useToggle(
    false
  );

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
        {swappingVideo ? (
          <HeaderButton
            onClick={() => {
              setSwappingVideo(null);
            }}
          >
            cancel
          </HeaderButton>
        ) : (
          <HeaderButton onClick={showSelector}>explore videos</HeaderButton>
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
              isSelectingVideos={isSelectingVideos}
              isSwappingVideo={!!swappingVideo}
              swapVideoAtIndex={index => swapVideo(index, swappingVideo)}
            />
          )}
          {isSelectingVideos && (
            <Modal
              isOpen={true}
              onRequestClose={hideSelector}
              style={{
                content: {
                  padding: 0,
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
              <div
                css={{
                  width: '100%',
                  top: 0,
                  height: headerHeight,
                  position: 'sticky',
                  zIndex: 1,
                  backgroundColor: styles.backgroundColor,
                }}
              >
                <HeaderButton
                  style={{ float: 'right', margin: '0 10px 0 0' }}
                  onClick={hideSelector}
                >
                  Cancel
                </HeaderButton>
              </div>
              {data.allVideos &&
                map(video => (
                  <Button
                    key={video.id}
                    css={{
                      height: 100,
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: styles.textColor,
                      border: 0,
                      fontSize: '16px',
                      padding: '0 0 0 10px',
                      overflow: 'hidden',
                      borderBottom: `1px solid ${styles.borderColor}`,
                      'media screen and (min-width: 480px)': {
                        fontSize: '24px',
                      },
                    }}
                    onClick={() => {
                      setSwappingVideo(video);
                      hideSelector();
                    }}
                  >
                    <div css={{ float: 'left', lineHeight: '100px' }}>
                      {`${format('MMMM do, yyyy, h:mm a')(new Date(video.createdAt))}`}
                    </div>
                    <div
                      css={{
                        height: 100,
                        width: 100,
                        float: 'right',
                      }}
                    >
                      <PreviewButton video={video} />
                    </div>
                  </Button>
                ))(data.allVideos)}
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
    video: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default VideoManager;
