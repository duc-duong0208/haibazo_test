import React, { ChangeEvent, memo, FC } from "react";
import "./styles.css";
interface Props {
  value: number | null;
  setValue: React.Dispatch<React.SetStateAction<number | null>>;
}
const InputCommon: FC<Props> = ({ value, setValue }) => {
  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (parseInt(e.target.value, 10)) {
      setValue(+e.target.value);
    } else {
      setValue(null);
    }
  };
  return (
    <input
      value={value || ""}
      className="w-[200px] p-1 border border-gray-400 focus:outline-none no-spin-button"
      onChange={handleOnChange}
    />
  );
};

export default memo(InputCommon);
