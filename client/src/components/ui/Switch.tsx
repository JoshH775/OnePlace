import { Switch as HeadlessSwitch } from "@headlessui/react";

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: React.ReactNode;
}

export default function Switch({checked, onChange, children}: Props){

    const handleChange = (checked: boolean) => {
        onChange(checked);
    }

    return (
        <HeadlessSwitch
            checked={checked}
            onChange={handleChange}
            className={`${
                checked ? 'bg-indigo-600' : 'bg-gray-200'
            } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
        >
            <span
                className={`${
                    checked ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
            {children}
        </HeadlessSwitch>
    )
}