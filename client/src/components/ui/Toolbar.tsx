import React from "react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  loading: boolean;
};

const Toolbar = ({ children, isOpen, loading }: Props) => {
  return (
    <div
      id="toolbar"
      className={`flex items-center justify-center shadow-lg gap-6 w-fit rounded-full border dark:bg-onyx dark:border-onyx-light p-2 ease-out px-7 absolute transition-all left-1/2 -translate-x-1/2 bottom-15 ${
        isOpen ? "scale-100 opacity-100" : "scale-80 opacity-0"
      } ${loading ? "bg-gray-400 cursor-not-allowed" : ""}`}
    >
      {children}
    </div>
  );
};

export default Toolbar;
