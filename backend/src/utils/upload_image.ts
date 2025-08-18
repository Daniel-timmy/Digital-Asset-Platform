import { put } from '@vercel/blob';
import { HttpError } from '../error/HttpError';
import logger from '../logger/app.logger';

async function uploadImage(name: string, file: File, folder: string): Promise<string>{

    const blob = await put(`${folder}/${name}`, file, { access: 'public' });
    if (!blob) throw new HttpError("Unable to upload image", 500)
    return blob.url; 
   
}

export default uploadImage;