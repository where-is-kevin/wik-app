import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SearchSvg = ({ ...props }) => (
  <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
    <Path
      d="M21.5 21L17.16 16.66M19.5 11C19.5 15.4183 15.9183 19 11.5 19C7.08172 19 3.5 15.4183 3.5 11C3.5 6.58172 7.08172 3 11.5 3C15.9183 3 19.5 6.58172 19.5 11Z"
      stroke="#6F6F76"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SearchSvg;
