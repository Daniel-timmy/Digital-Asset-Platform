import sharp from 'sharp';

interface FileObject {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}


async function convertToWebP(file: FileObject): Promise<FileObject> {
    const webpBuffer = await sharp(file.buffer).webp({ quality: 70 }).toBuffer();
    return {
        ...file,
        buffer: webpBuffer,
        size: webpBuffer.length,
        mimetype: 'image/webp',
    };
}

export default convertToWebP;