import { Button } from "@headlessui/react";

type Props = {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};

export default function IconButton({ icon, onClick, className, disabled = false }: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`flex rounded-full transition-colors duration-150 items-center gap-2 p-1 aspect-square text-onyx dark:text-white ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 hover:dark:bg-onyx-light'
      } ${className}`}
    >
      {icon}
    </Button>
  );
}