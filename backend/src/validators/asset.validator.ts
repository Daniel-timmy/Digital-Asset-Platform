import * as z from "zod"


const AssetV = z.object({
    name: z.string().nonoptional(),
    file_url: z.string().nonoptional(),
    thumbnail_url: z.string().nonoptional(),
    
})