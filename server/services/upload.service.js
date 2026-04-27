import fs from "fs/promises"
import path from "path"
import multer from "multer"
import sharp from "sharp"
import crypto from "crypto"
import AppError from "../utils/appError.js"
import { ensureDir, fileExists, removeFile, removeFiles, removeDirIfEmpty, toPosixPath } from "../utils/fsHelpers.js"
import { ALLOWED_IMAGE_MIMES, ALLOWED_DOC_MIMES, validateImageMime, validateDocMime } from "../utils/fileValidations.js"

const uploadRoot = path.join(process.cwd(), process.env.UPLOAD_DIR);

function makeId() {
    return crypto.randomBytes(12).toString("hex");
}

function memoryUploader({maxFiles, maxSize}) {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            files: maxFiles,
            fileSize: maxSize
        }  
    })
}

async function saveOptimizedImage({ buffer, outputPath, width= 1600, height= 1600, quality= 82, fit= "inside" }) {
    await sharp(buffer).rotate().resize({width, height, fit, withoutEnlargement: true}).webp({ quality }).toFile(outputPath)
}

async function saveAvatarImage({buffer, outputPath}) {
    await sharp(buffer).rotate().resize({width: 400, height: 400, fit: cover, position: "center"}).webp({ quality: 84 }).toFile(outputPath);
}

async function saveRawFile(buffer, outputPath) {
    await fs.writeFile(outputPath, buffer)
}

export function requestImageUploadMiddleware() {
    return memoryUploader({
        maxFiles: 5,
        maxSize: 5 * 1024 * 1024
    }).array('requestImages', 5)
}

export function AvatarUploadMiddleware() {
    return multer({
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024
    }).single("avatar")
}

export function providerDocsUploadMiddleware() {
    return memoryUploader({
        maxFiles: 10,
        maxSize: 10 * 1024 * 1024
    }).array("businessDocs", 10);
}

export async function processRequestImages({ files, requestId }) {
    const savedFilesPath = [];
    const imageDocs = [];

    const targetDir = path.join(uploadRoot, "requests", String(requestId));
    await ensureDir(targetDir);

    try {
        for (const file of files) {
            validateImageMime(file);

            const fileName = `request-${makeId()}.webp`;
            const absolutePath = path.join(targetDir, fileName);

            await saveOptimizedImage({ buffer: file.buffer,outputPath: absolutePath });

            savedFilesPath.push(absolutePath);

            imageDocs.push({
                url: toPosixPath(`/uploads/requests/${requestId}/${fileName}`),
                alt: file.originalname
            })
        }

        return {savedFilesPath, imageDocs}

    } catch (err) {
        removeFiles(savedFilesPath);
        throw err;
    }
}

export async function processAvatarImage({ file, userId }) {
    
    validateImageMime(file);

    const targetDir = path.join(uploadRoot, 'users', "profile", String(userId));
    await ensureDir(targetDir);

    const fileName = `avatar.webp`;
    const absolutePath = path.join(targetDir, fileName);

    const oldPng = path.join(targetDir, "avatar.png")
    const oldJpg = path.join(targetDir, "avatar.jpg")
    const oldJpeg = path.join(targetDir, "avatar.jpeg")
    const oldWebp = path.join(targetDir, "avatar.webp")

    removeFiles([oldJpeg, oldJpg, oldPng, oldWebp])

    await saveOptimizedImage({buffer: file.buffer, outputPath: absolutePath});

    return {
        url: toPosixPath(`/uploads/users/profiles/${userId}/${fileName}`),
        absolutePath
    }
}

export async function processProviderDocs({ files, applicationId }) {
    
    const savedPaths = [];
    const businessDocs = []

    try {
        for(const file of files) {
            validateDocMime(file)

            const targetDir = path.join(uploadRoot, 'provider-applications', String(applicationId));
            await ensureDir(targetDir);

            let fileName;
            let absolutePath;
            let finalMimeType = file.mimetype;

            if(finalMimeType.startsWith('image')) {
                fileName = `doc-${makeId()}.webp`;
                absolutePath = path.join(targetDir, fileName)
                await saveOptimizedImage(file.buffer, absolutePath)
                finalMimeType = "image/webp"
            } else if (finalMimeType === "applocation/pdf") {
                const fileName = `doc-${makeId()}.pdf`;
                absolutePath = path.join(targetDir, fileName);
                await saveRawFile({buffer: file.buffer, outputPath: absolutePath});
            } else {
                throw new AppError("unsupported file type", 400);
            }

            savedPaths.push(absolutePath);

            businessDocs.push({
                url: toPosixPath(`/uploads/provider-applications/${applicationId}/${fileName}`),
                originalName: file.originalName,
                mimeType: finalMimeType,
                size: file.size
            })
        }

        return { businessDocs, savedPaths };
    } catch (err) {
        await removeFiles(savedFilesPath)
        throw err;
    }
}