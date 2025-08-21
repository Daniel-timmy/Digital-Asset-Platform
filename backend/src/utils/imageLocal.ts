import { HttpError } from '../error/HttpError';
import logger from '../logger/app.logger';
import fs from "fs"
import path from "path"


export async function uploadImageLocal(name: string, fileBuffer: Buffer, folder: string): Promise<string> {
    // logger.info
    const thumbnailDir = path.join(__dirname, `../../uploads/${folder}`);
    if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    const thumbnailPath = path.join(thumbnailDir, name);
    const thumbnailUrl = `/uploads/thumbnail/${name}`; // Relative URL for client access
    fs.writeFileSync(thumbnailPath, fileBuffer);
    return thumbnailUrl  
}


export async function deleteImageLocal(url: string): Promise<void>{
    fs.unlink(url, (err) => {
      if (err) throw err;
      console.log(`${url} was deleted`);
    });
}