import React, { useRef, useEffect, useState, Suspense } from 'react';
import { createResource, createCache, SimpleCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import fp from 'lodash/fp';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const videoCache = createCache();
const imageCache = createCache();

// eslint-disable-next-line promise/avoid-new
const videoDataLoader = createResource(
  videoUrl =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = `/s3proxy?url=${videoUrl}`;
      video.autoplay = false;
      video.addEventListener('error', e => {
        debugger
      });

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
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = `/s3proxy?url=${imageUrl}`;
      image.addEventListener('load', resolve);
      image.addEventListener('error', reject);
    })
);

const Video = ({ video: { videoUrl }, hidden, playing }) => {
  const videoRef = useRef(null);
  useEffect(
    () => {
      if (playing && videoRef.current.paused) {
        videoRef.current.play();
      } else if (!videoRef.current.paused) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    },
    [playing]
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

const Button = ({ video }) => {
  const [touching, setTouching] = useState(false);
  return (
    <Suspense fallback="loading video...">
      <div
        style={{ display: 'inline-block' }}
        onMouseDown={() => setTouching(true)}
        onMouseUp={() => setTouching(false)}
      >
        <Video video={video} hidden={!touching} playing={touching} />
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
