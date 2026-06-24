import Image from 'next/image';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Media } from "@/payload-types";

interface ImageProps {
    imageId: string;
    width?: number;
    height?: number;
}

export default async function PayloadImage({ imageId, width, height }: ImageProps) {
    const payload = await getPayload({ config });

    // Fetch media document from Payload
    const media = (await payload.findByID({
        collection: 'media',
        id: imageId,
    })) as Media;

    // Fallback if no media or URL is found
    if (!media || !media.url) {
        return <div className="image-placeholder">No image found</div>;
    }

    const imageWidth = width ?? media.width;
    const imageHeight = height ?? media.height;

    if (!imageWidth || !imageHeight) {
        return <div className="image-placeholder">Image dimensions missing</div>;
    }

    return (
        <div className="image-container relative">
            <Image
                src={media.url}
                alt={media.alt || 'Uploaded asset'}
                width={imageWidth}
                height={imageHeight}
                priority={true} // Add if this image appears above the fold
            />
        </div>
    );
}
