import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";
const PigeonSvg = ({ ...props }) => (
  <Svg width={35} height={34} viewBox="0 0 35 34" fill="none" {...props}>
    <Path
      d="M0.858398 8.32062C0.858398 3.72527 4.58367 0 9.17902 0C13.7744 0 17.4996 3.72527 17.4996 8.32062V16.6412H0.858398V8.32062Z"
      fill="#5C3CFA"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.858398 16.6416C0.858397 25.8323 8.30893 33.2828 17.4996 33.2828C26.6903 33.2828 34.1409 25.8323 34.1409 16.6416L17.4996 16.6416L0.858398 16.6416Z"
      fill="#5C3CFA"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.4993 16.6416C12.904 16.6416 9.17871 20.3669 9.17871 24.9622C9.17872 29.5576 12.904 33.2828 17.4993 33.2828L17.4993 24.9622L17.4993 16.6416Z"
      fill="#3200B9"
    />
    <Circle cx={8.65879} cy={8.84043} r={2.60019} fill="white" />
    <Circle cx={8.65875} cy={8.84039} r={1.56012} fill="#131314" />
    <Path
      d="M17.5 15.6006C15.8308 15.6005 14.4676 14.29 14.3838 12.6416L14.3799 12.4805C14.3799 10.7573 15.7768 9.36041 17.5 9.36035V15.6006Z"
      fill="white"
    />
    <Path d="M22.7004 15.6008L17.5 9.36035V15.6008H22.7004Z" fill="#F84808" />
  </Svg>
);
export default PigeonSvg;
