import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ScreenClassProvider } from './responsiveSystem';
import { CustomComponent } from './component';

const App = () => {
  return (
    <ScreenClassProvider>
      <CustomComponent
        someColor="#000000"
        someText="Hello"
        xs={{ someColor: 'rebeccapurple', someText: 'xs' }}
        sm={{ andSmaller: true, someColor: 'palevioletred', someText: 'sm' }}
        md={{ andLarger: true, someColor: 'brown', someText: 'md' }}
        lg={{ someColor: 'green', someText: 'lg' }}
      />
    </ScreenClassProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
