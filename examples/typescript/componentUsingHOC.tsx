import * as React from 'react';
import { responsive } from './responsiveSystem';

type CustomComponentProps = {
  someColor?: string;
  someText: string;
};

//
// ─── FUNCTION COMPONENT ─────────────────────────────────────────────────────────
//

const FunctionComponent: React.FC<CustomComponentProps> = (props) => {
  const { someColor = '#000000', someText = 'Default text' } = props;

  return (
    <div
      style={{
        height: 100,
        width: 100,
        color: 'white',
        backgroundColor: someColor,
      }}
    >
      {someText}
    </div>
  );
};

FunctionComponent.displayName = 'FunctionComponent';

export const FunctionComponentWithHOC = responsive(FunctionComponent);

//
// ─── FORWARD-REF COMPONENT ──────────────────────────────────────────────────────
//

const ForwardRefComponent = React.forwardRef<HTMLDivElement, CustomComponentProps>((props, ref) => {
  const { someColor = '#000000', someText = 'Default text' } = props;

  return (
    <div
      ref={ref}
      style={{
        height: 100,
        width: 100,
        color: 'white',
        backgroundColor: someColor,
      }}
    >
      {someText}
    </div>
  );
});

ForwardRefComponent.displayName = 'ForwardRefComponent';

export const ForwardRefComponentWithHOC = responsive(ForwardRefComponent);

//
// ─── CLASS COMPONENT ────────────────────────────────────────────────────────────
//

export class ClassComponent extends React.Component<CustomComponentProps> {
  render() {
    const { someColor = '#000000', someText = 'Default text' } = this.props;

    return (
      <div
        style={{
          height: 100,
          width: 100,
          color: 'white',
          backgroundColor: someColor,
        }}
      >
        {someText}
      </div>
    );
  }
}

export const ClassComponentWithHOC = responsive(ClassComponent);

//
// ─── HOST COMPONENT ─────────────────────────────────────────────────────────────
//

export const HostComponentWithHOC = responsive('div');
