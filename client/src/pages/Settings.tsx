import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../components/AuthProvider";
import api from "../utils/api";
import Panel from "../components/ui/Panel"
import { SettingKeyType } from "@shared/types";
import { useState } from "react";
import Switch from "@frontend/components/ui/Switch";
import { UserSettingsKeys } from "@shared/constants";


export default function Settings(){


    const user = useAuth().user!;
    const setSettingsContext = useAuth().setSettingsContext;
    const settings = user.settings;
    const integrations = user.integrations;

    console.log(settings)





    // const { mutate: disconnectIntegration, isPending } = useMutation({
    //     mutationFn: (integration: string) => api.disconnectIntegration(integration),
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({queryKey: ['user']})
    //     }
    // })

    const { mutate: updateSetting, isPending: isPendingSetting } = useMutation({
        mutationFn: (setting: { key: SettingKeyType, value: string}) => {
            return api.updateSetting(setting)
        },
        onSuccess: (data) => {
            setSettingsContext({...settings, [data.key]: {value: data.value}})
        }
    })


    return (<div className="flex-grow flex flex-col justify-start w-full p-5">
        <p className="text-4xl font-semibold pb-4">Settings</p>

        <Panel className="w-full">
            <p className="indigo-underline text-3xl font-bold">Cloud Services</p>
            <p>Manage your connected Cloud Storage vendors and control auto-upload behaviour</p>
            <div className="switches w-[90%]">
                <Switch checked={settings[UserSettingsKeys.GOOGLE_AUTO_UPLOAD] === 'true'} onChange={(checked) => updateSetting({key: UserSettingsKeys.GOOGLE_AUTO_UPLOAD, value: checked.toString()})}>Google Photos Auto Upload</Switch>
            </div>
        </Panel>

{/* 
        {user?.integrations?.google && <Button onClick={disconnectGoogle} disabled={isPending}>Disconnect Google</Button>}
        {!user?.integrations?.google && <Button onClick={()=>{window.location.href = '/api/auth/google'}} >Link Account With Google</Button>} */}
    </div>)
}