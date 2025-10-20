import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CreateTypeSvg = ({ ...props }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M11.6413 4.79264C11.7594 4.67445 11.9 4.58115 12.0548 4.51824C12.2096 4.45533 12.3754 4.4241 12.5425 4.42639L18.45 4.50014C18.7388 4.50403 19.0146 4.62055 19.2187 4.82486C19.4227 5.02918 19.5389 5.30513 19.5425 5.59389L19.625 11.5064C19.6273 11.6732 19.5962 11.8387 19.5335 11.9933C19.4708 12.1479 19.3778 12.2883 19.26 12.4064L10.985 20.6814C10.7506 20.9157 10.4327 21.0474 10.1013 21.0474C9.7698 21.0474 9.45192 20.9157 9.21751 20.6814L3.36626 14.8351C3.13192 14.6007 3.00027 14.2828 3.00027 13.9514C3.00027 13.6199 3.13192 13.302 3.36626 13.0676L11.6413 4.79264Z"
      fill="#D6D6D9"
      stroke="#D6D6D9"
      strokeWidth={0.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 7.5L20.75 3.25"
      stroke="#D6D6D9"
      strokeWidth={0.875}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default CreateTypeSvg;
