import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface CheckboxSvgProps {
  selected?: boolean;
}

const CheckboxSvg: React.FC<CheckboxSvgProps> = ({ selected = false }) => {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        fill="#FFF"
        stroke={selected ? "#3C62FA" : "#A3A3A8"}
        strokeWidth="2"
      />
      {selected && (
        <Path
          d="M4.5 8L7 10.5L11.5 6"
          stroke="#3C62FA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
};

export default CheckboxSvg;