export function removeTags(html: string) {
    return html.replace(/<[^>]+>/g, '');
}