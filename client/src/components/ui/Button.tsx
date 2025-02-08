import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";

type Props = {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: "filled" | "outlined";
}

export default function Button({ onClick, children, className, variant = 'filled' }: Props) {
    const baseClasses = "flex items-center gap-2 p-2 text-center rounded-md cursor-pointer justify-center w-full transition duration-150";
    const variantClasses = variant === "filled" ? "bg-indigo text-white data-[hover]:bg-indigo-700" : "border border-gray-300 dark:border-onyx-light  dark:text-white data-[hover]:bg-gray-200 dark:data-[hover]:bg-onyx-light";

    const fullClassname = baseClasses + " " + variantClasses + " " + (className ?? '');

    return (
        <HeadlessButton onClick={onClick} className={fullClassname}>
            {children}
        </HeadlessButton>
    )


}