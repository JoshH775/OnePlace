import api from "./api";

  
async function createPickerSession() {
    const { status, data } = await api.req("/google/picker");

    if (status !== 200) {
        console.error("Failed to open picker session");
        return null;
    }

    return data.config;
}


export async function importFromGoogle() {
    const session = await createPickerSession()
    console.log('Session:', session);

    if (!session) return

    const link = document.createElement("a");
    link.href = session.pickerUri;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);




    const pollSession = async () => {
        const { status, data } = await api.req('/google/picker/poll', {
            method: 'POST',
            body: { sessionId: session.id }
        });

        if (status !== 200) {
            console.error('Failed to poll session');
            return;
        }

        console.log('Polling session:', data);

        // Check if the media items are set
        if (data.mediaItemsSet) {
            console.log('Media items set:', data);

            // If media items are set, delete the session
            await api.req('/google/picker/delete', {
                method: 'DELETE',
                body: { sessionId: session.id }
            });

            return true; // Return true if media items are set
        }

        return false; // Return false if media items are not yet set
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


   
}