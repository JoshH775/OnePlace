import React from "react";

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  loading?: boolean;
  className?: string;
};

const Toolbar = ({ children, isOpen, loading = false, className = '' }: Props) => {
  return (
    <>
    {isOpen && <div
      id="toolbar"
      className={`flex items-center justify-center shadow-lg gap-6 w-fit rounded-full border dark:bg-onyx dark:border-onyx-light p-2 ease-out px-7 absolute left-1/2 -translate-x-1/2 bottom-15 ${loading ? "bg-gray-400 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </div>}
    </>)
    
};

export default Toolbar;
