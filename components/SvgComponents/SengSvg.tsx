import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SendSvg = ({ ...props }) => (
  <Svg width={33} height={33} viewBox="0 0 33 33" fill="none" {...props}>
    <Path
      d="M28.9711 4.0275L14.3082 18.6905M4.49707 11.3228L27.3302 3.40112C28.7363 2.91328 30.0854 4.26233 29.5975 5.66845L21.6758 28.5016C21.1331 30.0658 18.9366 30.1087 18.3333 28.5668L14.7075 19.3011C14.5264 18.8383 14.1603 18.4722 13.6976 18.2911L4.43181 14.6654C2.88997 14.062 2.93285 11.8655 4.49707 11.3228Z"
      stroke="#F2F2F3"
      strokeWidth={2.25}
      strokeLinecap="round"
    />
  </Svg>
);
export default SendSvg;
