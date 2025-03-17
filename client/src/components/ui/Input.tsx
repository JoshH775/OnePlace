import React from 'react';
import clsx from 'clsx';

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return (
        <input 
            {...rest} 
            className={clsx("w-full p-2 m-2 mx-0 rounded-md dark:bg-onyx-light dark:border-gray-500 border data-[focus]:ring-indigo", className)} 
        />
    );
}