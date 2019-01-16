import React, { useRef, useState, Suspense } from 'react';
import { createResource, createCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import fp from 'lodash/fp';
import gql from 'graphql-tag';
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
  const promises = fp.flow(
    fp.filter(fp.has('promise')),
    fp.map('promise')
  )(resourceResults);
  if (promises.length) {
    throw Promise.all(promises);
  }
  return fp.map('resource')(resourceResults);
};

const playBuffer = buffer => {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(audioContext.currentTime);
  return source;
};

const VideoButton = ({ video }) => {
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

const VideoSuspender = ({ video }) => (
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
      <VideoButton video={video} />
    </Suspense>
  </div>
);

const Buttons = () => (
  <Query query={videosQuery}>
    {({ loading, data }) => {
      if (loading) return 'loading...';
      // return <VideoSuspender key={data.videos[0].id} video={data.videos[0]} />;
      return fp.map(video => <VideoSuspender key={video.id} video={video} delayMs={0} />)(
        data.videos.slice(0, 12)
      );
    }}
  </Query>
);

export default Buttons;
