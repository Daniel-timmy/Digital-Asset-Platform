import { put, del, PutBlobResult } from '@vercel/blob';
import { HttpError } from '../error/HttpError';
import logger from '../logger/app.logger';


async function uploadImage(name: string, file: Buffer, folder: string): Promise<PutBlobResult>{
    logger.info
    const blob = await put(`${folder}/${name}`, file, { access: 'public' });
    if (!blob) throw new HttpError("Unable to upload asset", 500)
    return blob ; 
   
}

export async function updateImage(bloburl: string, file: Buffer): Promise<string>{
    const updatedBlob = await put(bloburl, file, { access: 'public' });
    if (!updatedBlob) throw new HttpError("Unable to upload image", 500)
    return updatedBlob.url; 
}

export async function deleteImage(url: string){
    await del(url)
}

export default uploadImage;