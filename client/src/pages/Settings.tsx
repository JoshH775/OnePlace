import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../components/AuthProvider";
import api from "../utils/api";
import Button from "../components/ui/Button";

export default function Settings(){

    const { user } = useAuth();

    console.log(user)

    const queryClient = useQueryClient();

    const { mutate: disconnectIntegration, isPending } = useMutation({
        mutationFn: (integration: string) => api.disconnectIntegration(integration),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user']})
        }
    })

    const disconnectGoogle = () => {
        disconnectIntegration('google')
    }

    return (<div className="flex-grow flex justify-center items-center w-full">

        {user?.integrations?.google && <Button onClick={disconnectGoogle} disabled={isPending}>Disconnect Google</Button>}
        {!user?.integrations?.google && <Button onClick={()=>{window.location.href = '/api/auth/google'}} >Link Account With Google</Button>}
    </div>)
}