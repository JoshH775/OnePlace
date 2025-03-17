import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import clsx from "clsx";

type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "filled" | "outlined" | "danger";
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClasses = {
  filled: "bg-indigo text-white data-[hover]:bg-indigo-700",
  outlined: "border border-gray-300 dark:border-onyx-light dark:text-white data-[hover]:bg-gray-200 dark:data-[hover]:bg-onyx-light",
  danger: "bg-red-500 text-white data-[hover]:bg-red-600",
};

export default function Button({
  onClick = () => {},
  children,
  className,
  variant = "filled",
  disabled,
  ...rest
}: Props) {
  const baseClasses = "flex items-center gap-2 p-2 text-center font-semibold rounded-md cursor-pointer justify-center w-full transition duration-150 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50";
  const fullClassname = clsx(className, baseClasses, variantClasses[variant], {
    "cursor-not-allowed": disabled,
  });

  return (
    <HeadlessButton onClick={onClick} className={fullClassname} disabled={disabled} {...rest}>
      {children}
    </HeadlessButton>
  );
}