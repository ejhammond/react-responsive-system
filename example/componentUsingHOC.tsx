import * as React from 'react';
import { responsive } from './responsiveSystem';

type CustomComponentProps = {
  someColor?: string;
  someText: string;
};

const CustomComponent: React.FC<CustomComponentProps> = (props) => {
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

CustomComponent.displayName = 'CustomComponent';

export const CustomComponentWithHOC = responsive(CustomComponent);
