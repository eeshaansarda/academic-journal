import {IsDefined} from "class-validator";
import {ContentType} from "@helper/file/file";

/**
 * Represents an authorization header to get a submission.
 */
export class GetSubmissionHeader {
    @IsDefined()
    'content-type': ContentType;

    @IsDefined()
    authorization: string;
}

/**
 * Represents the authorization header to get the metadata of a submission.
 */
export class GetMetadataHeader {
    @IsDefined()
    authorization: string;
}