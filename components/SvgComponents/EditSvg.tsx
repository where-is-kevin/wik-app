import * as React from "react";
import Svg, { Path } from "react-native-svg";
const EditSvg = ({ ...props }) => (
  <Svg width={22} height={23} viewBox="0 0 22 23" fill="none" {...props}>
    <Path
      d="M12.5999 18.2124H17.9333M4.06665 18.2124L7.94753 17.4304C8.15355 17.3889 8.34272 17.2875 8.49129 17.1388L17.179 8.44635C17.5955 8.02959 17.5952 7.35405 17.1784 6.93764L15.338 5.09935C14.9213 4.68311 14.2461 4.68339 13.8297 5.09998L5.14111 13.7934C4.99283 13.9417 4.89158 14.1305 4.85003 14.3361L4.06665 18.2124Z"
      stroke="#6A0C31"
      strokeWidth={1.77778}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default EditSvg;
