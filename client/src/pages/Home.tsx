import NoPhotos from "./Photos/NoPhotos"


export default function Home() {


    const noPhotos = true




    return (
        <div className="content w-full">

            {noPhotos && <NoPhotos />}

        </div>
    )
}
