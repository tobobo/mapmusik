import React, { useState, useEffect } from 'react';
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
  });
  return orientation;
};

const Player = () => {
  const orientation = useOrientation();
  return (
    <div
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        display: 'grid',
        gridTemplateRows: orientation === 'portrait' ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
        gridTemplateColumns: orientation === 'portrait' ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
      }}
    >
      <Buttons />
    </div>
  );
};

export default Player;
