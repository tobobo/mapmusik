import React, { useRef, useState, useEffect, Suspense } from 'react';
import { createResource, createCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import union from 'lodash/fp/union';
import map from 'lodash/fp/map';
import gql from 'graphql-tag';
import reject from 'lodash/fp/reject';
import has from 'lodash/fp/has';
import includes from 'lodash/fp/includes';
import toPairs from 'lodash/fp/toPairs';
import equals from 'lodash/fp/equals';
import { Query } from 'react-apollo';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const videoCache = createCache();
const imageCache = createCache();
const audioCache = createCache();

const videoDataLoader = createResource(
  videoUrl =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.autoplay = false;

      const checkLoad = setInterval(() => {
        if (video.error) {
          reject(video.error);
          return;
        }
        if (video.readyState === 1) {
          clearInterval(checkLoad);
          resolve(video);
        }
      }, 1);
    })
);

const imageDataLoader = createResource(
  imageUrl =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) => {
      console.log('fetching image', imageUrl);
      const image = new Image();
      image.src = imageUrl;
      image.addEventListener('load', resolve);
      image.addEventListener('error', reject);
    })
);

const ImagePreview = ({ video: { thumbnailUrl }, hidden }) => (
  <img style={{ width: '100%' }} hidden={hidden} src={thumbnailUrl} />
);

const audioBufferLoader = createResource(async url => {
  const response = await fetch(`/s3proxy?url=${url.replace('video.360.mp4', 'mp3.128k.mp3')}`);
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
    console.log('catching', key, promise);
    return { promise };
  }
};

const combinedLoader = (videoUrl, imageUrl, audioUrl) => {
  const resourceResults = [
    null,
    // tryResource(videoDataLoader)(videoCache, videoUrl),
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
  source.connect(audioContext.destination);
  source.start(audioContext.currentTime);
  return source;
};

const usePressedKeys = () => {
  const [pressedKeys, setPressedKeys] = useState([]);
  const addPressedKey = key => setPressedKeys(prevPressedKeys => union(prevPressedKeys)([key]));
  const removePressedKey = key => setPressedKeys(prevPressedKeys => reject(equals(key))(prevPressedKeys));
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

const VideoButton = ({ video, isActivatedByKeyboard }) => {
  const [touching, setTouching] = useState(false);
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const isPlayingRef = useRef(false);
  const [, , buffer] = combinedLoader(video.videoUrl, video.thumbnailUrl, video.audioUrl);
  const play = () => {
    if (isPlayingRef.current) return;
    videoRef.current.play();
    sourceRef.current = playBuffer(buffer, audioContext);
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
      if (touching === isActivatedByKeyboard) return;
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
      style={{
        display: 'inline-block',
        position: 'relative',
        width: '100%',
        height: '100%',
        opacity: touching ? '1' : '0.2',
      }}
      onMouseDown={() => {
        if (touching) return;
        setTouching(true);
        play();
      }}
      onTouchStart={() => {
        setTouching(true);
        play();
      }}
      onMouseUp={() => {
        if (!touching) return;
        setTouching(false);
        reset();
      }}
      onTouchEnd={() => {
        setTouching(false);
        reset();
      }}
    >
      <div style={{ position: 'absolute' }}>
        <ImagePreview video={video} />
      </div>
      <video
        autoPlay={false}
        controls={false}
        muted
        playsInline
        ref={videoRef}
        src={video.videoUrl}
        style={{ position: 'absolute', width: '100%' }}
        hidden={!touching}
      />
    </div>
  );
};

VideoButton.propTypes = {
  video: PropTypes.shape({
    videoUrl: PropTypes.string.isRequired,
  }).isRequired,
};

const videosQuery = gql`
  {
    videos {
      id
      videoUrl
      thumbnailUrl
      audioUrl
    }
  }
`;

const VideoSuspender = ({ video, isActivatedByKeyboard }) => (
  <div
    style={{
      display: 'inline-block',
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      border: '1px solid #223322',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      KhtmlUserSelect: 'none',
      MozUseSelect: 'none',
      MsUserSelect: 'none',
      UserSelect: 'none',
    }}
  >
    <Suspense fallback="loading video...">
      <VideoButton video={video} isActivatedByKeyboard={isActivatedByKeyboard} />
    </Suspense>
  </div>
);

const videoKeys = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];

const Buttons = () => {
  const isKeyPressed = usePressedKeys();
  return (
    <Query query={videosQuery}>
      {({ loading, data }) => {
        if (loading) return 'loading...';
        // return <VideoSuspender key={data.videos[0].id} video={data.videos[0]} />;
        return flow(
          toPairs,
          map(([index, video]) => (
            <VideoSuspender
              key={video.id}
              video={video}
              // eslint-disable-next-line security/detect-object-injection
              isActivatedByKeyboard={isKeyPressed(videoKeys[index])}
            />
          ))
        )(data.videos.slice(0, 12));
      }}
    </Query>
  );
};

export default Buttons;
