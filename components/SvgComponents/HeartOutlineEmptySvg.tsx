import * as React from "react";
import Svg, { Path } from "react-native-svg";
const HeartOutlineEmptySvg = ({ stroke = "#131314", ...props }) => (
  <Svg width={24} height={21} viewBox="0 0 24 21" fill="none" {...props}>
    <Path
      d="M20.5935 2.50025C22.5268 4.43355 22.6009 7.54449 20.7616 9.56749L11.5463 19.7037L2.33203 9.56749C0.492863 7.54449 0.566938 4.43349 2.50024 2.50019C4.65889 0.34154 8.21403 0.53879 10.1211 2.92261L11.5469 4.70418L12.9714 2.92241C14.8785 0.538589 18.4349 0.341602 20.5935 2.50025Z"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default HeartOutlineEmptySvg;
