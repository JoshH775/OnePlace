import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";

type Props = {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: "filled" | "outlined" | "danger";
    disabled?: boolean;
}

const variantClasses = {
    'filled': "bg-indigo text-white data-[hover]:bg-indigo-700",
    'outlined': "border border-gray-300 dark:border-onyx-light  dark:text-white data-[hover]:bg-gray-200 dark:data-[hover]:bg-onyx-light",
    'danger': "bg-red-500 text-white data-[hover]:bg-red-600"

}

export default function Button({ onClick = ()=>{}, children, className, variant = 'filled', disabled }: Props) {
    let baseClasses = "flex items-center gap-2 p-2 text-center font-semibold rounded-md cursor-pointer justify-center w-full transition duration-150 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ";
    if (disabled) {
        baseClasses += "cursor-not-allowed";
    }

    const fullClassname = baseClasses + " " + variantClasses[variant]  + " " +(className ?? '');

    return (
        <HeadlessButton onClick={onClick} className={fullClassname} disabled={disabled}>
            {children}
        </HeadlessButton>
    )


}