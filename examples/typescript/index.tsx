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
        someText="overridden"
        xs={{ someColor: 'rebeccapurple', someText: 'xs' }}
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
        lg={{ someColor: 'green', someText: 'lg' }}
      />
      <ForwardRefComponentWithHOC
        ref={forwardRefCompRef}
        someColor="#000000"
        someText="overridden"
        xs={{ someColor: 'rebeccapurple', someText: 'xs' }}
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
        lg={{ someColor: 'green', someText: 'lg' }}
      />
      <ClassComponentWithHOC
        ref={classCompRef}
        someColor="#000000"
        someText="overridden"
        xs={{ someColor: 'rebeccapurple', someText: 'xs' }}
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
        lg={{ someColor: 'green', someText: 'lg' }}
      />
      <HostComponentWithHOC
        ref={hostCompRef}
        style={{ color: 'white', height: 100, width: 100, backgroundColor: '#000000' }}
        xs={(baseProps) => ({
          ...baseProps,
          style: { ...baseProps.style, backgroundColor: 'rebeccapurple' },
          children: 'xs',
        })}
        sm={(baseProps) => ({
          ...baseProps,
          style: { ...baseProps.style, backgroundColor: 'palevioletred' },
          children: 'sm',
        })}
        md={(baseProps) => ({
          ...baseProps,
          style: { ...baseProps.style, backgroundColor: 'brown' },
          children: 'md',
        })}
        lg={(baseProps) => ({
          ...baseProps,
          style: { ...baseProps.style, backgroundColor: 'green' },
          children: 'lg',
        })}
      />
      <CustomComponentWithHook
        someColor="#000000"
        someText="overridden"
        xs={{ someColor: 'rebeccapurple', someText: 'xs' }}
        sm={{ someColor: 'palevioletred', someText: 'sm' }}
        md={{ someColor: 'brown', someText: 'md' }}
        lg={{ someColor: 'green', someText: 'lg' }}
      />
    </ScreenClassProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
