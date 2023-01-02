import {Service} from "typedi";
import Bull from "bull";
import {BanModel, IBanRepository} from "@models/ban/banModel";
import { config } from "@config/config";

@Service()
export default class BanService {
    private queue: Bull.Queue<{}>;
    private banModel: IBanRepository;

    /**
     * Creates a new ban service.
     */
    constructor() {
        this.queue = new Bull('ban', config.redisServer);
        this.banModel = BanModel;
        this.setUp();
    }

    /**
     * Sets up the redis queue.
     */
    private setUp(): void {
        this.queue.process(async (job) => {
            await this.banModel.deleteExpiredBans();
        }).then(_ => this.queue.add({}, { repeat: { cron: '*/1 * * * *' } }));
    }
}