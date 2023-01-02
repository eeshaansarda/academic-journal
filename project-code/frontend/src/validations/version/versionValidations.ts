
export function validateSubmission(submission: File | null) {
    if (!submission)
        return "You must upload a version";

    return undefined;
}

export function validateVersionName(version: string) {
    if (!version.trim())
        return "You must specify a version";

    return undefined;
}