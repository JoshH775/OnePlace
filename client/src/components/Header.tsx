type Props = {
    children: React.ReactNode;
    className?: string;
}

export default function Header({ children, className = '' }: Props) {
    return (
        <div className={`flex items-center justify-between w-full   ${className}`}>
            {children}
        </div>
    )
}