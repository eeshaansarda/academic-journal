export function getTitleValidation(title: string): string | undefined {
    if (!title.trim())
        return 'Title is required';

    return undefined;
}

export function getContentValidation(content: string): string | undefined {
    if (!content.trim())
        return 'Content is required';

    return undefined;
}