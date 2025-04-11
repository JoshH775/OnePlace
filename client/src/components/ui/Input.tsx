import React, { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...rest }, ref) => {
        return (
            <input
                {...rest}
                ref={ref}
                className={clsx(
                    "w-full p-2 m-2 mx-0 rounded-md dark:bg-onyx-light dark:border-gray-500 border data-[focus]:ring-indigo",
                    className
                )}
            />
        );
    }
);

export default Input;