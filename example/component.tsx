import * as React from 'react';
import { Adaptive, useAdaptiveProps } from './adaptiveProps';

type CustomComponentProps = {
  someColor?: string;
  someText: string;
};

export const CustomComponent: React.FC<
  Adaptive<CustomComponentProps>
> = props => {
  const { someColor = '#000000', someText = 'Default text' } = useAdaptiveProps<
    CustomComponentProps
  >(props);

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
