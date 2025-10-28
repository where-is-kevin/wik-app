import * as React from "react";
import Svg, { Path } from "react-native-svg";
const HeartFullSvg = ({ ...props }) => (
  <Svg width={16} height={15} viewBox="0 0 16 15" fill="none" {...props}>
    <Path
      d="M14.0043 2.28869C15.2874 3.57183 15.3366 5.63658 14.1159 6.97925L7.9996 13.7067L1.88407 6.97925C0.663411 5.63658 0.712575 3.57179 1.99572 2.28865C3.42842 0.855945 5.78798 0.986861 7.05374 2.56902L8.00001 3.75145L8.94546 2.56888C10.2112 0.986728 12.5716 0.855987 14.0043 2.28869Z"
      fill="#CCFF3A"
      stroke="#131314"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default HeartFullSvg;
