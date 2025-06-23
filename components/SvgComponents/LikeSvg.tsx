import * as React from "react";
import Svg, { Path } from "react-native-svg";
const LikeSvg = ({ ...props }) => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none" {...props}>
    <Path
      d="M8.75016 2.63098L10.8102 6.80431L15.4168 7.47765L12.0835 10.7243L12.8702 15.311L8.75016 13.1443L4.63016 15.311L5.41683 10.7243L2.0835 7.47765L6.69016 6.80431L8.75016 2.63098Z"
      stroke="#131314"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default LikeSvg;
