import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SendSvgSmall = ({ ...props }) => (
  <Svg width={23} height={23} viewBox="0 0 23 23" fill="none" {...props}>
    <Path
      id="Icon"
      d="M20.5703 2.30058L9.90635 12.9646M2.771 7.60626L19.3769 1.84503C20.3995 1.49024 21.3807 2.47137 21.0259 3.494L15.2646 20.0999C14.87 21.2375 13.2725 21.2687 12.8337 20.1474L10.1968 13.4086C10.0651 13.0721 9.79882 12.8058 9.46226 12.6741L2.72354 10.0372C1.60219 9.59843 1.63338 8.00094 2.771 7.60626Z"
      stroke="#E5E5E6"
      strokeWidth={2.25}
      strokeLinecap="round"
    />
  </Svg>
);
export default SendSvgSmall;
