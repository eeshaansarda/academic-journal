import Bull from "bull";
import {Service} from "typedi";
import { config } from "@config/config";
import {ISubmissionModel, SubmissionModel} from "@models/submission/submissionModel";

@Service()
export default class PublishedService {
    private queue: Bull.Queue<{}>;
    public submissionModel: ISubmissionModel;

    /**
     * Creates a new published service.
     */
    constructor() {
        this.queue = new Bull('publications_queue', config.redisServer);
        this.submissionModel = SubmissionModel;
        this.setUp();
    }

    /**
     * Sets up the redis queue to reset the publications every day at 2am.
     */
    private setUp(): void {
        this.queue.process(async (job) => {
            await this.submissionModel.resetStats();
        }).then(_ =>this.queue.add({}, { repeat: { cron: '* 00 2 * *' } }));
    }
}
