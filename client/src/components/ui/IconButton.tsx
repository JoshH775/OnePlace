type Props = {
    icon: React.ReactNode;
    onClick: () => void;
    className?: string;
}

export default function IconButton({ icon, onClick, className }: Props) {
    return (
        <button onClick={onClick} className={"flex items-center gap-2 p-1 text-center rounded-full cursor-pointer justify-center " + className}>
            {icon}
        </button>
    )
}