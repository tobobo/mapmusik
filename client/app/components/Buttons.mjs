import React, { createRef, useEffect, Suspense } from 'react';
import { createResource, createCache, SimpleCache } from 'simple-cache-provider';
import PropTypes from 'prop-types';
import fp from 'lodash/fp';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const cache = createCache();

// eslint-disable-next-line promise/avoid-new
const videoFileLoader = createResource(async videoUrl => {
  // eslint-disable-next-line promise/avoid-new
  const videoElement = await new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = `/s3proxy?url=${videoUrl}`;
    video.autoplay = false;
    video.addEventListener('error', reject);

    const checkLoad = setInterval(() => {
      if (video.readyState === 4) {
        clearInterval(checkLoad);
        resolve(video);
      }
    }, 1);
  });

  const hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.width = 100;
  hiddenCanvas.height = 100;
  const context = hiddenCanvas.getContext('2d');
  videoElement.play();
  // eslint-disable-next-line promise/avoid-new
  const videoData = await new Promise(resolve => {
    const framesArray = [];
    const interval = setInterval(() => {
      console.log('current time', videoElement.currentTime);
      context.drawImage(videoElement, 0, 0);
      framesArray.push(context.getImageData(0, 0, 100, 100));
      const nextCurrentTime = videoElement.currentTime + 1 / 30;
      if (nextCurrentTime > videoElement.duration) {
        clearInterval(interval);
        resolve(framesArray);
      }
      videoElement.currentTime = nextCurrentTime;
    }, 100);
  });
  return videoData;
});

const Video = ({ video: { videoUrl } }) => {
  const videoData = videoFileLoader.read(cache, videoUrl);
  const canvasRef = createRef();
  useEffect(
    () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      let currentFrame = 0;
      const interval = setInterval(() => {
        console.log('putting data');
        context.putImageData(videoData[currentFrame], 0, 0);
        currentFrame = (currentFrame + 1) % videoData.length;
      }, 1000 / 30);
      return () => clearInterval(interval);
    },
    [videoUrl]
  );
  return <canvas width="100" height="100" style={{ border: '1px solid black' }} ref={canvasRef} />;
};

const Button = ({ video }) => (
  <Suspense fallback="loading video...">
    <Video video={video} />
  </Suspense>
);

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
    }
  }
`;

const Buttons = () => (
  <Query query={videosQuery}>
    {({ loading, data }) => {
      if (loading) return 'loading...';
      return <Button key={data.videos[0].id} video={data.videos[0]} />;
      // return fp.map(video => <Button key={video.id} video={video} />)(data.videos);
    }}
  </Query>
);

export default Buttons;
