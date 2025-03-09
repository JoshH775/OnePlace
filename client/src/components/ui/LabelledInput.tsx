import { Input, Label } from "@headlessui/react";

type Props = {
    label: string;
    id: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function LabelledInput({ label, id, ...inputProps }: Props) {
    return (
        <div className="flex flex-col">
            <Label htmlFor={id} className="font-semibold">{label}</Label>
            <Input id={id} {...inputProps} className="p-2 m-2 mx-0 rounded-md dark:bg-onyx-light dark:border-gray-500 border data-[focus]:ring-indigo"/>
        </div>
    );
}