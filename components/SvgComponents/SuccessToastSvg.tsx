import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SuccessToastSvg = ({ ...props }) => (
  <Svg width={25} height={25} viewBox="0 0 25 25" fill="none" {...props}>
    <Path
      d="M16.1758 10.2383L11.6536 14.7617L8.82422 11.931"
      stroke="#0B2E34"
      strokeWidth={1.30339}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.5 21.3828C17.4058 21.3828 21.3828 17.4058 21.3828 12.5C21.3828 7.59416 17.4058 3.61719 12.5 3.61719C7.59416 3.61719 3.61719 7.59416 3.61719 12.5C3.61719 17.4058 7.59416 21.3828 12.5 21.3828Z"
      stroke="#0B2E34"
      strokeWidth={1.30339}
      strokeMiterlimit={10}
    />
  </Svg>
);
export default SuccessToastSvg;
