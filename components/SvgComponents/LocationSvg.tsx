import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface LocationSvgProps {
  color?: string;
  [key: string]: any;
}

const LocationSvg = ({ color = "#F2F2F3", ...props }: LocationSvgProps) => (
  <Svg width={17} height={16} viewBox="0 0 17 16" fill="none" {...props}>
    <Path
      d="M13.8334 6.66659C13.8334 9.99525 10.1407 13.4619 8.90075 14.5326C8.78523 14.6194 8.64461 14.6664 8.50008 14.6664C8.35555 14.6664 8.21493 14.6194 8.09941 14.5326C6.85941 13.4619 3.16675 9.99525 3.16675 6.66659C3.16675 5.2521 3.72865 3.89554 4.72885 2.89535C5.72904 1.89516 7.08559 1.33325 8.50008 1.33325C9.91457 1.33325 11.2711 1.89516 12.2713 2.89535C13.2715 3.89554 13.8334 5.2521 13.8334 6.66659Z"
      stroke={color}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.50008 8.66659C9.60465 8.66659 10.5001 7.77115 10.5001 6.66659C10.5001 5.56202 9.60465 4.66659 8.50008 4.66659C7.39551 4.66659 6.50008 5.56202 6.50008 6.66659C6.50008 7.77115 7.39551 8.66659 8.50008 8.66659Z"
      stroke={color}
      strokeWidth={1.33333}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default LocationSvg;
