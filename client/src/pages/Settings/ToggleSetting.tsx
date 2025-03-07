import Switch from '../../components/ui/Switch';

type Props = {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export default function ToggleSetting({ label, checked, onChange, disabled }: Props) {
    return (
        <div className='flex gap-3 py-1 items-center'>
            <Switch checked={checked} onChange={onChange} disabled={disabled} />
            <p className=''>{label}</p>
        </div>
    )
}