import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ScreenClassProvider, useResponsiveValue } from './responsiveSystem';

const Component = () => {
  const value = useResponsiveValue('default', {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  });
  return (
    <div
      style={{
        height: 100,
        width: 100,
        border: '1px solid black',
        textAlign: 'center',
      }}
    >
      {value}
    </div>
  );
};
const App = () => {
  return (
    <ScreenClassProvider>
      <Component />
    </ScreenClassProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
