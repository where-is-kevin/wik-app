import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface QuestionMarkSvgProps {
  color?: string;
  [key: string]: any;
}

const QuestionMarkSvg = ({ color = "#6F6F76", ...props }: QuestionMarkSvgProps) => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
    <Path
      d="M14 27C21.1797 27 27 21.1797 27 14C27 6.8203 21.1797 1 14 1C6.8203 1 1 6.8203 1 14C1 21.1797 6.8203 27 14 27Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={14.0002} cy={21.2223} r={1.44444} fill={color} />
    <Path
      d="M11.1111 9.66678C11.1111 9.17435 11.2369 8.69009 11.4767 8.26C11.7165 7.8299 12.0623 7.46823 12.4812 7.20935C12.9 6.95046 13.3782 6.80295 13.8701 6.78081C14.362 6.75868 14.8514 6.86266 15.2919 7.08288C15.7323 7.3031 16.1092 7.63225 16.3866 8.03908C16.6641 8.44591 16.8329 8.9169 16.8772 9.40734C16.9214 9.89778 16.8395 10.3914 16.6393 10.8413C16.4391 11.2912 16.1272 11.6824 15.7333 11.9779C15.218 12.3304 14.7927 12.799 14.4916 13.3459C14.1905 13.8928 14.0221 14.5028 13.9999 15.1268V15.4446"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default QuestionMarkSvg;
