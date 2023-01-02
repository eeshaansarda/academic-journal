import Bull from "bull";
import {IZipExtractor, ZipExtractor} from "@helper/zip/zip";
import { config } from "@config/config";
import path from "path";
import {Service} from "typedi";
import {ISupportingDocument} from "@models/submission/supportingDocument/supportingDocumentModel";
import {IVersion} from "@models/submission/version/versionModel";

export interface ISubmissionService {
    deleteSubmission: (deleteSubmission: DeleteSubmission) => void;
}

interface DeleteSubmission {
    versions: IVersion[];
    supportingDocuments: ISupportingDocument[];
}

@Service()
export default class SubmissionService implements ISubmissionService {
    private queue: Bull.Queue<DeleteSubmission>;
    private zipExtract: IZipExtractor;

    /**
     * Creates a new submission service.
     */
    constructor () {
        this.queue = new Bull('submission', config.redisServer);
        this.zipExtract = new ZipExtractor();
        this.setUp();
    }

    /**
     * Sets up the redis submission queue.
     */
    private setUp(): void {
        this.queue.process( async (job) =>  {
            const deleteSubmission = job.data;

            // Delete all versions (this includes the actual submission
            await Promise.all(deleteSubmission.versions.map(version => {
                this.zipExtract.deleteZip(path.join(config.baseSubmissionFolder, `${version.directory}.zip`));
            }));

            // The supportingDocuments zip
            await Promise.all(deleteSubmission.supportingDocuments.map(document => {
                const supportingDocumentFileName = `${document.id}${path.extname(document.fileName)}`;
                this.zipExtract.deleteZip(path.join(config.supportingDocumentFolder, supportingDocumentFileName));
            }));
        });
    }

    /**
     * Deletes a given submission.
     * @param deleteSubmission The submission to delete.
     */
    deleteSubmission(deleteSubmission: DeleteSubmission): void {
        this.queue.add(deleteSubmission);
    }
}