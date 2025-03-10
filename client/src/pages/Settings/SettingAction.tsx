import Panel from "@frontend/components/ui/Panel";
import Button from "../../components/ui/Button"


type Props = {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonVariant?: "filled" | "outlined" | "danger";
    onClick: () => void;
    loading: boolean;
    className?: string;
    buttonClassName?: string;
}

export default function SettingAction({
    title,
    subtitle,
    buttonText,
    buttonVariant = "filled",
    onClick,
    loading,
    className = '',
    buttonClassName = '',
}: Props) {


  return (
    <Panel className={`p-4 flex flex-row justify-between w-full ${className}`}>
      <div className="flex flex-col">
        <p className="font-semibold text-xl">{title}</p>
        <p className="text-sm text-gray-500 dark:text-subtitle-dark dark:text-whit">
            {subtitle}
        </p>
      </div>
      <Button
        variant={buttonVariant}
        onClick={onClick}
        disabled={loading}
        className={`!w-1/5 ${buttonClassName}`}
      >
        {buttonText}
      </Button>
    </Panel>
  )
}
