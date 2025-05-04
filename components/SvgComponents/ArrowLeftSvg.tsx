import * as React from "react";
import Svg, { G, Mask, Path, Rect } from "react-native-svg";
const ArrowLeftSvg = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <G id="Arrow Left">
      <Mask
        id="mask0_6508_4826"
        style={{
          maskType: "alpha",
        }}
        maskUnits="userSpaceOnUse"
        x={5}
        y={0}
        width={14}
        height={24}
      >
        <Path
          id="Shape"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.5482 0.939574C19.1503 1.52535 19.1503 2.47507 18.5482 3.06084L9.36072 12L18.5482 20.9391C19.1503 21.5249 19.1503 22.4746 18.5482 23.0604C17.9462 23.6462 16.9701 23.6462 16.368 23.0604L5.00031 12L16.368 0.939574C16.9701 0.353801 17.9462 0.353801 18.5482 0.939574Z"
          fill="#006FFD"
        />
      </Mask>
      <G mask="url(#mask0_6508_4826)">
        <Rect
          id="Fill"
          x={0.000610352}
          y={-0.00170898}
          width={23.9991}
          height={23.9994}
          fill="#493CFA"
        />
      </G>
    </G>
  </Svg>
);
export default ArrowLeftSvg;
