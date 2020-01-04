import React from 'react';
import PropTypes from 'prop-types';
import { ScreenClassProvider } from './responsive-system';

export default function Providers({ element }) {
  return <ScreenClassProvider>{element}</ScreenClassProvider>;
}

Providers.propTypes = {
  element: PropTypes.node.isRequired,
};
