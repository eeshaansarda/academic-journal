export interface Comment {
    commentId: number;
    payload: string;
    commentMade: string;
    commenter: { userId: string; username: string; }
    anchor: {
        start: number;
        end: number;
    } | null,
    parentId: number | null;
}