import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ScreenClassProvider } from './responsiveSystem';
import {
  ForwardRefComponentWithHOC,
  FunctionComponentWithHOC,
  ClassComponentWithHOC,
  ClassComponent,
  HostComponentWithHOC,
} from './componentUsingHOC';
import { CustomComponentWithHook } from './componentUsingHook';

const App = () => {
  const forwardRefCompRef = React.useRef<HTMLDivElement>(null);
  const classCompRef = React.useRef<InstanceType<typeof ClassComponent>>(null);
  const hostCompRef = React.useRef<HTMLDivElement>(null);

  return (
    <ScreenClassProvider>
      <FunctionComponentWithHOC
        someColor="#000000"
        someText="default"
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
      />
      <ForwardRefComponentWithHOC
        ref={forwardRefCompRef}
        someColor="#000000"
        someText="default"
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
      />
      <ClassComponentWithHOC
        ref={classCompRef}
        someColor="#000000"
        someText="default"
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
      />
      <HostComponentWithHOC
        ref={hostCompRef}
        style={{ color: 'white', height: 100, width: 100, backgroundColor: '#000000' }}
        sm={{
          style: { backgroundColor: 'palevioletred' },
          children: 'sm',
        }}
        md={{
          style: { backgroundColor: 'brown' },
          children: 'md',
        }}
      >
        default
      </HostComponentWithHOC>
      <CustomComponentWithHook
        someColor="#000000"
        someText="default"
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
      />
    </ScreenClassProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
