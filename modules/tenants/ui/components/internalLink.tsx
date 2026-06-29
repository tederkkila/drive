import { SerializedLinkNode } from '@payloadcms/richtext-lexical'

export const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
    const { value, relationTo } = linkNode.fields.doc!

    const url = typeof value !== 'string' && value.url

    // console.log("internalDocToHref: ", linkNode, url, relationTo)

    if (relationTo === 'media') {
        return `${url}`
    } else {
        return `${url}`
    }
}