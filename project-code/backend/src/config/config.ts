import * as debugConfig from '@config/debugConfig.json';
import * as productionConfig from '@config/productionConfig.json';

export interface IConfig {
    dbUrl: string;
    baseSubmissionFolder: string;
    profilePictureFolder: string;
    backendUrl: string;
    journalUrl: string;
    journalId: string;
    buildDirectory: string;
    logging?: boolean;
}

export const config = process.env.MODE == 'production' ? productionConfig : debugConfig;
