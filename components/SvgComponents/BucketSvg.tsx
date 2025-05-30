import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const BucketSvg = ({ ...props }) => (
  <Svg width={18} height={19} viewBox="0 0 18 19" fill="none" {...props}>
    <G clipPath="url(#clip0_6922_40707)">
      <Path
        d="M3.11756 6.42989V14.5181C3.11756 14.9081 3.2725 15.2822 3.54829 15.558C3.82407 15.8338 4.19812 15.9887 4.58815 15.9887H6.05874M14.8823 6.42989V14.5181C14.8823 14.9081 14.7273 15.2822 14.4515 15.558C14.1758 15.8338 13.8017 15.9887 13.4117 15.9887H11.9411M6.79403 11.5769L8.99991 9.37106M8.99991 9.37106L11.2058 11.5769M8.99991 9.37106V15.9887M2.38227 2.75342H15.6176C16.0237 2.75342 16.3529 3.08262 16.3529 3.48871V5.69459C16.3529 6.10069 16.0237 6.42989 15.6176 6.42989H2.38227C1.97617 6.42989 1.64697 6.10069 1.64697 5.69459V3.48871C1.64697 3.08262 1.97617 2.75342 2.38227 2.75342Z"
        stroke="white"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_6922_40707">
        <Rect
          width={17.6471}
          height={17.6471}
          fill="white"
          transform="translate(0.17627 0.547607)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
export default BucketSvg;
