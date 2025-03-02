import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../components/AuthProvider";
import api from "../utils/api";
import Button from "../components/ui/Button";
import Panel from "../components/ui/Panel";
import { Switch } from "@headlessui/react";

import { UserSettingsKeys } from "@shared/constants";

console.log(UserSettingsKeys)


export default function Settings(){

    const user = useAuth().user!;
    const settings = user.settings;
    const integrations = user.integrations;

    console.log(UserSettingsKeys)


    const queryClient = useQueryClient();

    const { mutate: disconnectIntegration, isPending } = useMutation({
        mutationFn: (integration: string) => api.disconnectIntegration(integration),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user']})
        }
    })

    const { mutate: updateSetting, isPending: isPendingSetting } = useMutation({
        mutationFn: (setting: { key: SettingKeyType, value: string}) => api.updateSetting(setting),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user']})
        }
    })

    function SwitchField({label, value, onChange}: {label: string, value: boolean, onChange: (value: boolean) => void}){
        return (
            <Switch
            checked={value}
            onChange={onChange}
            >   
            {label}
            </Switch>
        )


    }

    return (<div className="flex-grow flex justify-center items-center w-full px-[5%]">
        <Panel className="w-full">
            <h1 className="indigo-underline text-2xl font-bold">Closadasdas</h1>
            <p>Manage your connected Cloud Storage vendors and control auto-upload behaviour</p>
            <div className="switches w-[90%]">
                <SwitchField
                    label="Google Auto Upload"
                    value={settings.GOOGLE_AUTO_UPLOAD === 'true'}
                    onChange={(value) => updateSetting({key: 'google_auto_upload', value: value.toString()})}
                />
            </div>
        </Panel>

{/* 
        {user?.integrations?.google && <Button onClick={disconnectGoogle} disabled={isPending}>Disconnect Google</Button>}
        {!user?.integrations?.google && <Button onClick={()=>{window.location.href = '/api/auth/google'}} >Link Account With Google</Button>} */}
    </div>)
}