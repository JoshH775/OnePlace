export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props} className="w-full p-2 m-2 mx-0 rounded-md dark:bg-onyx-light dark:border-gray-500 border data-[focus]:ring-indigo"/>
    );
}