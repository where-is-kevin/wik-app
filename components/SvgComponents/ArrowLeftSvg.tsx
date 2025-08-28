import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = ({ ...props }) => (
  <Svg width={17} height={27} viewBox="0 0 17 27" fill="none" {...props}>
    <Path
      d="M14.1043 24.6094L3 13.505L14.1043 2.4007"
      stroke="#3C62FA"
      strokeWidth={4.44174}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
