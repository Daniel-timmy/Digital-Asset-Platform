import sharp from 'sharp';
import logger from '../logger/app.logger';

interface FileObject {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}


async function convertToWebP(file: FileObject): Promise<FileObject> {
    let webpBuffer: Buffer<ArrayBufferLike>;
    try{
        webpBuffer = await sharp(file.buffer).webp({ quality: 50 }).toBuffer();
        if (!webpBuffer || !Buffer.isBuffer(webpBuffer)) {
            throw new Error("Invalid thumbnail format");
        }
        return {
            ...file,
            buffer: webpBuffer,
            size: webpBuffer.length,
            mimetype: 'image/webp',
        };
    } catch(error) {
        logger.error('Error processing image:', error)
        throw error
    }
 
}

export default convertToWebP;