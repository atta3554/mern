import fs from "fs/promises"
import path from "path"

export async function ensureDir(path) {
    await fs.mkdir(path, { recursive: true });
}

export async function fileExists(filePath) {
    try {
        fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function removeFile(path) {
    try{ 
        await fs.unlink();
    } catch (err) {
        if(err.code !== "ENOENT") throw err;
    }
}

export async function removeFiles(filePaths = []) {
    await Promise.all(filePaths.map(removeFile));
}

export async function removeDirIfEmpty(DirPath) {
    try {
        const files = await fs.readdir(DirPath)
    
        if(files.length === 0) {
            await fs.rmdir(DirPath)
        }
    } catch {}
}

export function toPosixPath(p) {
    return p.split(path.sep).join('/');
}