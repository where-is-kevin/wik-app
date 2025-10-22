import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CalendarSvg = ({ ...props }) => (
  <Svg width={15} height={15} viewBox="0 0 15 15" fill="none" {...props}>
    <Path
      d="M4.13086 3.46818V1.02734"
      stroke="#A3A3A8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.86914 3.46818V1.02734"
      stroke="#A3A3A8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 5.73633H13"
      stroke="#A3A3A8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 9.32962V3.12934C1 2.88991 1.09511 2.66028 1.26442 2.49098C1.43372 2.32168 1.66335 2.22656 1.90278 2.22656H13.0972C13.3367 2.22656 13.5663 2.32168 13.7356 2.49098C13.9049 2.66028 14 2.88991 14 3.12934V13.0716C14 13.3111 13.9049 13.5407 13.7356 13.71C13.5663 13.8793 13.3367 13.9744 13.0972 13.9744H1.90278C1.66335 13.9744 1.43372 13.8793 1.26442 13.71C1.09511 13.5407 1 13.3111 1 13.0716V9.32962Z"
      stroke="#A3A3A8"
      strokeWidth={1.08333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CalendarSvg;
