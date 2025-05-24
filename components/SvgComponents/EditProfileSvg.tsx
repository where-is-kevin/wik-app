import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
const EditProfileSvg = ({ ...props }) => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none" {...props}>
    <Circle cx={16} cy={16} r={16} fill="#3C62FA" />
    <Path
      d="M17.6002 22.7124H22.9335M9.06689 22.7124L12.9478 21.9304C13.1538 21.8889 13.343 21.7875 13.4915 21.6388L22.1792 12.9464C22.5958 12.5296 22.5955 11.854 22.1786 11.4376L20.3382 9.59935C19.9215 9.18311 19.2463 9.18339 18.83 9.59998L10.1414 18.2934C9.99307 18.4417 9.89183 18.6305 9.85027 18.8361L9.06689 22.7124Z"
      stroke="white"
      strokeWidth={1.77778}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default EditProfileSvg;
