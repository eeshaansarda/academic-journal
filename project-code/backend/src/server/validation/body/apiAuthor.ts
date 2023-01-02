import {IsDefined} from 'class-validator';

/**
 * Represents an author.
 */
export class ApiAuthor {
    @IsDefined()
    id: string;

    @IsDefined()
    username: string;
}