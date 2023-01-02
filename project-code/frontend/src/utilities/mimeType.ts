export function isImage(mimeType: string) {
    return mimeType.indexOf('image') !== -1;
}

export function isMarkdown(fileName: string) {
    return fileName.endsWith(".md");
}

export function isPdf(mimeType: string) {
    return mimeType === "application/pdf";
}

export function isJupyterNotebook(fileName: string) {
    return fileName.endsWith('.ipynb');
}