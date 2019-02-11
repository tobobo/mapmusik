import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import Buttons from './Buttons.mjs';

const getOrientation = () =>
  window.screen.height > window.screen.width ? 'portrait' : 'landscape';

const useOrientation = () => {
  const [orientation, setOrientation] = useState(getOrientation());
  useEffect(() => {
    const onOrientationChange = debounce(
      () => {
        setOrientation(getOrientation());
      },
      100,
      { trailing: true }
    );
    window.addEventListener('orientationChange', onOrientationChange);
    return () => window.removeEventListener('orientationchange', onOrientationChange);
  }, []);
  return orientation;
};

/* eslint-disable-next-line react/display-name */
const Player = memo(({ videos, isSelectingVideos, isSwappingVideo, swapVideoAtIndex }) => {
  const orientation = useOrientation();
  return (
    <div
      css={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        display: 'grid',
        gridGap: '1px',
        gridTemplateRows: orientation === 'portrait' ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
        gridTemplateColumns: orientation === 'portrait' ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
      }}
    >
      <Buttons
        videos={videos}
        isSelectingVideos={isSelectingVideos}
        isSwappingVideo={isSwappingVideo}
        swapVideoAtIndex={swapVideoAtIndex}
      />
    </div>
  );
});

Player.propTypes = {
  videos: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSelectingVideos: PropTypes.bool.isRequired,
  isSwappingVideo: PropTypes.bool.isRequired,
  swapVideoAtIndex: PropTypes.func.isRequired,
};

export default Player;
