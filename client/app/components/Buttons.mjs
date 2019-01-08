import React, { useRef, useEffect, useState, Suspense } from 'react';
import { createResource, createCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import fp from 'lodash/fp';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const videoCache = createCache();
const imageCache = createCache();
const audioCache = createCache();

const videoDataLoader = createResource(videoUrl =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    console.log('fetching video', videoUrl);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.autoplay = false;

    const checkLoad = setInterval(() => {
      if (video.error) {
        console.log('ve', video.error);
        reject(video.error);
        return;
      }
      if (video.readyState === 4) {
        clearInterval(checkLoad);
        resolve(video);
      }
    }, 1);
  }).catch(() => {
    console.log('error loading video', videoUrl);
  })
);

const imageDataLoader = createResource(imageUrl =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    console.log('fetching image', imageUrl);
    const image = new Image();
    image.src = imageUrl;
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  }).catch(() => {
    console.log('error loading image', imageUrl);
  })
);

const ImagePreview = ({ video: { thumbnailUrl }, hidden }) => (
  <img width={200} hidden={hidden} src={thumbnailUrl} />
);

const audioBufferLoader = createResource(async url => {
  console.log('fetching buffer', url);
  const audioStack = [];
  const response = await fetch(`/s3proxy?url=${url.replace('video.360.mp4', 'mp3.128k.mp3')}`);
  const buffer = await response.arrayBuffer();
  debugger;
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(
      buffer,
      buffer => {
        console.log('got good buffer');
        audioStack.push(buffer);
        resolve(audioStack);
      },
      (err) => {
        console.log('got bad buffer');
        reject(err);
        // resolve(audioStack);
        // reject(args[0]);
      }
    );
  });

  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const read = () =>
      reader.read().then(({ value: readValue, done }) => {
        // eslint-disable-next-line promise/always-return
        if (done) {
          console.log('done with audio');
          resolve(audioStack);
          return;
        }
        audioContext.decodeAudioData(
          readValue.buffer,
          buffer => {
            console.log('got good buffer');
            audioStack.push(buffer);
            read();
          },
          () => {
            console.log('got bad buffer');
            read();
            // resolve(audioStack);
            // reject(args[0]);
          }
        );
      });
    read();
  });
});

const tryResource = resource => (cache, key) => {
  try {
    return { resource: resource.read(cache, key) };
  } catch (promise) {
    if (!promise) debugger;
    console.log('catching', key, promise);
    return { promise };
  }
};

const combinedLoader = (videoUrl, imageUrl, audioUrl) => {
  console.log('combined loader');
  const resourceResults = [
    tryResource(videoDataLoader)(videoCache, videoUrl),
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

const scheduleBuffers = buffers => {
  let nextTime = 0;
  return fp.map(buffer => {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    if (nextTime === 0) {
      nextTime = audioContext.currentTime;
    }
    source.start(nextTime);
    nextTime += source.buffer.duration - 0.05;
    return source;
  })(buffers);
};

const VideoButton = ({ video }) => {
  console.log('rendering button');
  const [touching, setTouching] = useState(false);
  const videoRef = useRef(null);
  const sourcesRef = useRef(null);
  const isPlayingRef = useRef(false);
  const [, , buffers] = combinedLoader(video.videoUrl, video.thumbnailUrl, video.audioUrl);
  const play = () => {
    if (isPlayingRef.current) return;
    videoRef.current.play();
    sourcesRef.current = scheduleBuffers(buffers, audioContext);
    isPlayingRef.current = true;
  };
  const reset = () => {
    if (!isPlayingRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    fp.forEach(source => {
      source.stop();
    })(sourcesRef.current);
    isPlayingRef.current = false;
  };
  return (
    <div
      style={{
        display: 'inline-block',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUseSelect: 'none',
        MsUserSelect: 'none',
        UserSelect: 'none',
      }}
      onMouseDown={() => {
        if (touching) return;
        setTouching(true);
        play();
      }}
      onTouchStart={() => {
        setTouching(true);
        reset();
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
      <video
        width={200}
        hidden={!touching}
        autoPlay={false}
        controls={false}
        muted
        playsInline
        ref={videoRef}
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>
      <ImagePreview video={video} hidden={touching} />
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
  <Suspense fallback="loading video..." delayMs={0}>
    <VideoButton video={video} />
  </Suspense>
);

const Buttons = () => {
  console.log('render buttons', Buttons);
  return (
    <Query query={videosQuery}>
      {({ loading, data }) => {
        console.log('query state', loading);
        if (loading) return 'loading...';
        // return <VideoSuspender key={data.videos[0].id} video={data.videos[0]} />;
        return fp.map(video => <VideoSuspender key={video.id} video={video} delayMs={0} />)(
          data.videos.slice(0, 1)
        );
      }}
    </Query>
  );
};

export default Buttons;
