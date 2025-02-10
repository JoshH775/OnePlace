import api from "./api";

  
async function createPickerSession() {
    const { status, data } = await api.req("/google/picker");

    if (status !== 200) {
        if (status === 401) {
            console.error("Google integration not enabled");
        }
        console.error("Failed to open picker session");
        return null;
    }

    return data;
}


export async function importFromGoogle() {
    const session = await createPickerSession()
    console.log(session)
    if (!session) return

    const link = document.createElement("a");
    link.href = session.pickerUri;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);




    //returns false if media items are not set, true if media items are set
    const pollSession = async () => {
        const pollRequest = await api.req('/google/picker/poll', {
            method: 'POST',
            body: { sessionId: session.id }
        });

        if (pollRequest.status !== 200) {
            console.error('Failed to poll session');
            return;
        }

        console.log('Polling session:', pollRequest.data);

        if (pollRequest.data.mediaItemsSet) {
            console.log('Media items set:', pollRequest.data);


            const mediaReq = await api.req('/google/picker/media', {
                method: 'POST',
                body: { sessionId: session.id }
            });
        
            console.log(mediaReq.data)
            // If media items are set, delete the session
            await api.req('/google/picker/delete', {
                method: 'DELETE',
                body: { sessionId: session.id }
            });

            return true; 
        }

        return false; 
    };
        
    const intervalTime = 5000
    let currentPolls = 0
    const maxPolls = 10
    
    while (true) {
        const mediaItemsSet = await pollSession();

        if (mediaItemsSet) {
            console.log('Media items set, stopping polling');
            break;
        }

        currentPolls += 1;

        if (currentPolls >= maxPolls) {
            console.log('Max polls reached, stopping polling');
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalTime));
    }

    //get media items




   
}