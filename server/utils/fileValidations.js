import AppError from "./appError.js"

export const ALLOWED_IMAGE_MIMES = ["image/jpeg", 'image/png', 'image/webp'];
export const ALLOWED_DOC_MIMES = ['application/pdf', "image/jpeg", 'image/png', 'image/webp'];

export function validateImageMime(file) {
    if(!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        return new AppError("only jpg, png and webp are allowed", 400);
    }
}

export function validateDocMime(file) {
    if(!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
        return new AppError("only pdf, jpg, png and webp are allowed", 400);
    }
}