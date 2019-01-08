import React, { useRef, useEffect, useState, Suspense } from 'react';
import { createResource, createCache, SimpleCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import fp from 'lodash/fp';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const videoCache = createCache();
const imageCache = createCache();

const videoDataLoader = createResource(
  videoUrl =>
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.autoplay = false;

      const checkLoad = setInterval(() => {
        if (video.readyState === 4) {
          clearInterval(checkLoad);
          resolve(video);
        }
      }, 1);
    })
);

const imageDataLoader = createResource(
  imageUrl =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.addEventListener('load', resolve);
      image.addEventListener('error', reject);
    })
);

const Video = ({ video: { videoUrl }, hidden, playing, setPlay, setPause }) => {
  const videoRef = useRef(null);
  const playVideo = () => {
    if (playing && videoRef.current.paused) {
      videoRef.current.play();
    }
  };
  const resetVideo = () => {
    if (!videoRef.current.paused) {
      videoRef.current.pause();
    }
    videoRef.current.currentTime = 0;
  };
  useEffect(
    () => {
      setPlay(playVideo);
      setPause(resetVideo);
    },
    [videoUrl]
  );
  videoDataLoader.read(videoCache, videoUrl);
  return (
    <video
      width={200}
      hidden={hidden}
      src={videoUrl}
      autoPlay={false}
      controls={false}
      ref={videoRef}
    />
  );
};

const ImagePreview = ({ video: { thumbnailUrl }, hidden }) => {
  imageDataLoader.read(imageCache, thumbnailUrl);
  return <img width={200} hidden={hidden} src={thumbnailUrl} />;
};

const loadSound = async (url, audioContext) => {
  const audioStack = [];
  const response = await fetch(`/s3proxy?url=${url.replace('video.360.mp4', 'mp3.128k.mp3')}`);
  const reader = response.body.getReader();

  try {
    // eslint-disable-next-line promise/avoid-new
    await new Promise((resolve, reject) => {
      const read = () =>
        reader
          .read()
          .then(({ value: readValue, done }) => {
            // eslint-disable-next-line promise/always-return
            if (done) {
              resolve();
              return;
            }
            audioContext.decodeAudioData(
              readValue.buffer,
              buffer => {
                audioStack.push(buffer);
              },
              reject
            );
            read();
          })
          .catch(reject);
      read();
    });
  } catch (e) {}
  return audioStack;
};

const scheduleBuffers = (buffers, audioContext) => {
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

const Button = ({ video }) => {
  const [touching, setTouching] = useState(false);
  const [playAudio, setPlayAudio] = useState(() => {});
  const [stopAudio, setStopAudio] = useState(() => {});
  const videoRef = useRef(null);
  const sourceRef = useRef(null);
  const playVideo = () => {
    sourceRef;
    videoRef.current.play();
  };
  const resetVideo = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };
  useEffect(() => {
    loadSound(video.videoUrl, audioContext)
      .then(buffers => {
        setPlayAudio(() => () => {
          audioContext.resume();
          const sources = scheduleBuffers(buffers, audioContext);
          setStopAudio(() => () => {
            sources.forEach(source => {
              source.stop();
            });
          });
        });
      })
      .catch(console.log);
  }, []);
  return (
    <Suspense fallback="loading video...">
      <div
        style={{
          display: 'inline-block',
          '-webkit-touch-callout': 'none',
          '-webkit-user-select': 'none',
          '-khtml-user-select': 'none',
          '-moz-user-select': 'none',
          '-ms-user-select': 'none',
          'user-select': 'none',
        }}
        onMouseDown={() => {
          if (touching) return;
          setTouching(true);
          scheduleBuffers();
          playVideo();
          playAudio();
        }}
        onTouchStart={() => {
          setTouching(true);
          playVideo();
          playAudio();
        }}
        onMouseUp={() => {
          if (!touching) return;
          setTouching(false);
          resetVideo();
          stopAudio();
        }}
        onTouchEnd={() => {
          setTouching(false);
          resetVideo();
          stopAudio();
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
          <source src={video.videoUrl} type="video/mp4" ref={sourceRef} />
        </video>
        <ImagePreview video={video} hidden={touching} />
      </div>
    </Suspense>
  );
};

Button.propTypes = {
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
    }
  }
`;

const Buttons = () => (
  <Query query={videosQuery}>
    {({ loading, data }) => {
      if (loading) return 'loading...';
      // return <Button key={data.videos[0].id} video={data.videos[0]} />;
      return fp.map(video => <Button key={video.id} video={video} />)(data.videos);
    }}
  </Query>
);

export default Buttons;
