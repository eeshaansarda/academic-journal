export interface Announcement {
    id: string;
    author: { id: string, username: string };
    content: string;
    title: string;
    published: number;
}