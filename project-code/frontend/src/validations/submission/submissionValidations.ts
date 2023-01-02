export function validateTitle(title: string) {
    if (!title.trim()) {
        return 'Title is required';
    }
    return undefined;
}

export function validateDescription(description: string) {
    if (!description.trim()) {
        return 'Description is required';
    }
    return undefined;
}

export function validateInitialVersion(initialVersion: string) {
    if (!initialVersion.trim()) {
        return 'Initial version is required';
    }

    return undefined;
}