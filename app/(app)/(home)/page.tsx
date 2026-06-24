import React from "react";
import PayloadImage from "@/modules/media/QuickMedia"

export default function Home() {

    return (
        <div className="px-4 lg:px-12 py-8 flex flex-col gap-4">
            There is nothing to see here. Move along. :)
            <PayloadImage
                imageId={'6a3b04a295c406dd245a4832'}
                width={24}
                height={24}
            />
        </div>
    )
}
