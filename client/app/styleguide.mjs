import React from 'react';
import styles from './styles.mjs';

const Button = props => <button css={{ cursor: 'pointer' }} {...props} />;

const HeaderButton = props => (
  <Button
    css={{
      display: 'inline-block',
      height: styles.headerHeight,
      lineHeight: styles.headerHeight,
      backgroundColor: 'transparent',
      border: 0,
      color: styles.textColor,
      textDecoration: 'underline',
      float: 'left',
    }}
    {...props}
  />
);

// eslint-disable-next-line import/prefer-default-export
export { Button, HeaderButton };
