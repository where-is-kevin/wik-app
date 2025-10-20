import * as React from "react";
import Svg, { Path } from "react-native-svg";
const NavProfileSvgFilled = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
      fill="#3C62FA"
    />
    <Path
      d="M12 14.5C6.99003 14.5 2.91003 17.86 2.91003 22C2.91003 22.28 3.13003 22.5 3.41003 22.5H20.59C20.87 22.5 21.09 22.28 21.09 22C21.09 17.86 17.01 14.5 12 14.5Z"
      fill="#3C62FA"
    />
  </Svg>
);
export default NavProfileSvgFilled;
