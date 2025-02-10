type Props = {
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
}

export default function IconButton({ icon, onClick, className }: Props) {
    return (
        <button onClick={onClick} className={"flex items-center  text-center rounded-full cursor-pointer justify-center hover:bg-gray-200 transition-colors duration-150 " + className}>
            {icon}
        </button>
    )
}