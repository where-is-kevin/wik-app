import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CreateBucketPlus = ({ ...props }) => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
    <Path
      d="M9.00012 1.00001V17.0002M1 9.00012H17.0002"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CreateBucketPlus;
