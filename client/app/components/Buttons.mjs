import React, { useRef, useState, useEffect, Suspense, memo } from 'react';
import { createResource, createCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import union from 'lodash/fp/union';
import map from 'lodash/fp/map';
import has from 'lodash/fp/has';
import range from 'lodash/fp/range';
import includes from 'lodash/fp/includes';
import equals from 'lodash/fp/equals';
import negate from 'lodash/fp/negate';
import GridLoader from 'react-spinners/GridLoader';
import config from '../../../config/client.mjs';
import styles from '../styles.mjs';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const videoCache = createCache();
const imageCache = createCache();
const audioCache = createCache();

const videoDataLoader = createResource(async videoUrl => {
  const response = await fetch(`${config.assetPrefix}${videoUrl}`);
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
});

const imageDataLoader = createResource(
  imageUrl =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) => {
      console.log('fetching image', imageUrl);
      const image = new Image();
      image.src = `${config.assetPrefix}${imageUrl}`;
      image.addEventListener('load', resolve);
      image.addEventListener('error', reject);
    })
);

const ImagePreview = ({ video: { thumbnailUrl } }) => (
  <img css={{ width: '100%' }} src={`${config.assetPrefix}${thumbnailUrl}`} />
);

ImagePreview.propTypes = {
  video: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
};

const audioBufferLoader = createResource(async url => {
  const response = await fetch(`${config.assetPrefix}${url}`);
  const buffer = await response.arrayBuffer();
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(
      buffer,
      decodedBuffer => {
        console.log('got good buffer');
        resolve(decodedBuffer);
      },
      err => {
        console.log('got bad buffer');
        reject(err);
      }
    );
  });
});

const tryResource = resource => (cache, key) => {
  try {
    return { resource: resource.read(cache, key) };
  } catch (promise) {
    if (!promise || !promise.then) return { resouce: null };
    return { promise };
  }
};

const combinedLoader = (videoUrl, imageUrl, audioUrl) => {
  const resourceResults = [
    tryResource(videoDataLoader)(videoCache, videoUrl),
    tryResource(imageDataLoader)(imageCache, imageUrl),
    tryResource(audioBufferLoader)(audioCache, audioUrl),
  ];
  const promises = flow(
    filter(has('promise')),
    map('promise')
  )(resourceResults);
  if (promises.length) {
    throw Promise.all(promises);
  }
  return map('resource')(resourceResults);
};

const playBuffer = buffer => {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(audioContext.destination);
  source.start(audioContext.currentTime);
  return source;
};

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState([]);
  const addPressedKey = key => setPressedKeys(prevPressedKeys => union(prevPressedKeys)([key]));
  const removePressedKey = key =>
    setPressedKeys(prevPressedKeys => filter(negate(equals(key)))(prevPressedKeys));
  useEffect(() => {
    const onKeyDown = e => {
      const key = String.fromCharCode(e.keyCode || e.which);
      addPressedKey(key.toLowerCase());
    };
    const onKeyUp = e => {
      const key = String.fromCharCode(e.keyCode || e.which);
      removePressedKey(key.toLowerCase());
    };
    const onBlur = () => {
      setPressedKeys([]);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return key => includes(key.toLowerCase())(pressedKeys);
};

const VideoOverlayText = ({ children, ...props }) => (
  <div css={{ position: 'relative', height: '100%', width: '100%' }} {...props}>
    <div
      css={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '5px 10px',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '5px',
        color: styles.textColor,
      }}
    >
      {children}
    </div>
  </div>
);

VideoOverlayText.propTypes = {
  children: PropTypes.node.isRequired,
};

const VideoButton = ({ video, isActivatedByKeyboard, isEditingVideos, showSelector }) => {
  const [touching, setTouching] = useState(false);
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const isPlayingRef = useRef(false);
  const [videoObjectUrl, , audioBuffer] = combinedLoader(
    video.videoUrl,
    video.thumbnailUrl,
    video.audioUrl
  );
  const play = () => {
    if (isPlayingRef.current) return;
    videoRef.current.play();
    sourceRef.current = playBuffer(audioBuffer);
    isPlayingRef.current = true;
  };
  const reset = () => {
    if (!isPlayingRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    sourceRef.current.stop();
    isPlayingRef.current = false;
  };
  useEffect(
    () => {
      if (touching === isActivatedByKeyboard || isEditingVideos) return;
      if (isActivatedByKeyboard) {
        setTouching(true);
        play();
      } else {
        setTouching(false);
        reset();
      }
    },
    [isActivatedByKeyboard]
  );
  return (
    <div
      css={{
        display: 'inline-block',
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity: touching || isEditingVideos ? '1' : '0.2',
        cursor: 'pointer',
      }}
      onMouseDown={() => {
        if (isEditingVideos) {
          showSelector();
          return;
        }
        if (touching) return;
        setTouching(true);
        play();
      }}
      onTouchStart={() => {
        if (isEditingVideos) return;
        setTouching(true);
        play();
      }}
      onMouseUp={() => {
        if (isEditingVideos) return;
        if (!touching) return;
        setTouching(false);
        reset();
      }}
      onTouchEnd={() => {
        if (isEditingVideos) return;
        setTouching(false);
        reset();
      }}
    >
      <div css={{ position: 'absolute', top: 0, left: 0 }}>
        <ImagePreview video={video} />
      </div>
      <video
        autoPlay={false}
        controls={false}
        loop
        muted
        playsInline
        ref={videoRef}
        src={videoObjectUrl}
        css={{ position: 'absolute', width: '100%', top: 0, left: 0 }}
        hidden={!touching}
      />
      {isEditingVideos && <VideoOverlayText>change video</VideoOverlayText>}
    </div>
  );
};

VideoButton.propTypes = {
  video: PropTypes.shape({
    videoUrl: PropTypes.string.isRequired,
  }).isRequired,
  isActivatedByKeyboard: PropTypes.bool.isRequired,
  isEditingVideos: PropTypes.bool.isRequired,
  showSelector: PropTypes.func.isRequired,
};

const NoVideo = ({ isEditingVideos, showSelector }) =>
  isEditingVideos ? (
    <div
      css={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
        border: '0',
        cursor: 'pointer',
      }}
      onClick={showSelector}
    >
      <VideoOverlayText>add video</VideoOverlayText>
    </div>
  ) : null;

NoVideo.propTypes = {
  isEditingVideos: PropTypes.bool.isRequired,
  showSelector: PropTypes.func.isRequired,
};

// eslint-disable-next-line react/display-name
const VideoSuspender = memo(({ video, isActivatedByKeyboard, isEditingVideos, showSelector }) => (
  <div
    css={{
      display: 'inline-block',
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      boxShadow: '0 0 1px black',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUseSelect: 'none',
      MsUserSelect: 'none',
      UserSelect: 'none',
    }}
  >
    <Suspense
      fallback={
        <div style={{ position: 'relative', height: '100%', width: '100%', opacity: 0.5 }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <GridLoader
              css={{
                opacity: 0.5,
              }}
            />
          </div>
        </div>
      }
    >
      {video ? (
        <VideoButton
          video={video}
          isActivatedByKeyboard={isActivatedByKeyboard}
          isEditingVideos={isEditingVideos}
          showSelector={showSelector}
        />
      ) : (
        <NoVideo isEditingVideos={isEditingVideos} showSelector={showSelector} />
      )}
    </Suspense>
  </div>
));

VideoSuspender.propTypes = {
  video: PropTypes.object.isRequired,
  isActivatedByKeyboard: PropTypes.bool.isRequired,
  isEditingVideos: PropTypes.bool.isRequired,
  showSelector: PropTypes.bool.isRequired,
};

const videoKeys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

const Buttons = ({ videos, isEditingVideos, showSelectorForIndex }) => {
  const isKeyPressed = usePressedKeys();
  return map(index => (
    <VideoSuspender
      key={index}
      // eslint-disable-next-line security/detect-object-injection
      video={videos[index]}
      // eslint-disable-next-line security/detect-object-injection
      isActivatedByKeyboard={isKeyPressed(videoKeys[index])}
      isEditingVideos={isEditingVideos}
      showSelector={() => showSelectorForIndex(index)}
    />
  ))(range(0, 12));
};

Buttons.propTYpes = {
  videos: PropTypes.arrayOf(PropTypes.object).isRequired,
  isEditiingVIdeos: PropTypes.bool.isRequired,
  showSelectorForIndex: PropTypes.func.isRequired,
};

export default Buttons;
