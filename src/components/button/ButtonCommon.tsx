import React, { memo } from "react";

interface Props {
  title: string;
  onClick: () => void;
}

const ButtonCommon = ({ title, onClick }: Props) => {
  return (
    <button
      className="w-[120px] bg-gray-200 hover:bg-gray-300 border"
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default memo(ButtonCommon);
