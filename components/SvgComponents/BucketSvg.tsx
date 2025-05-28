import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
const BucketSvg = ({ ...props }) => (
  <Svg width={31} height={30} viewBox="0 0 31 30" fill="none" {...props}>
    <Circle cx={15.5} cy={15} r={15} fill="#131314" />
    <Path
      d="M10.1668 12.3333V19.6667C10.1668 20.0203 10.3073 20.3594 10.5574 20.6095C10.8074 20.8595 11.1465 21 11.5002 21H12.8335M20.8335 12.3333V19.6667C20.8335 20.0203 20.693 20.3594 20.443 20.6095C20.1929 20.8595 19.8538 21 19.5002 21H18.1668M13.5002 17L15.5002 15M15.5002 15L17.5002 17M15.5002 15V21M9.50016 9H21.5002C21.8684 9 22.1668 9.29848 22.1668 9.66667V11.6667C22.1668 12.0349 21.8684 12.3333 21.5002 12.3333H9.50016C9.13197 12.3333 8.8335 12.0349 8.8335 11.6667V9.66667C8.8335 9.29848 9.13197 9 9.50016 9Z"
      stroke="white"
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default BucketSvg;
