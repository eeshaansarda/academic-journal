import {IsDefined, IsInt} from "class-validator";
import {IBan} from "@models/ban/banModel";
import {IUser} from "@models/user/userModel";

/**
 * Represents a ban as a result of a submitted report.
 */
export class ApiReportBan {
    @IsDefined()
    reportId: string;

    @IsDefined()
    reason: string;

    @IsDefined()
    @IsInt()
    expiry: number;
}

/**
 * Represents a ban.
 */
export class ApiBan {
    @IsDefined()
    id: string;

    @IsDefined()
    reason: string;

    @IsDefined()
    expiry: number;

    subject: { id: string, username: string;  };

    issuer: { id: string; username: string; };

    /**
     * Creates a ban (to be returned from the API) from a stored ban.
     * @param ban The stored ban.
     * @returns The ban.
     */
    public static createApiBanFromDocument(ban: IBan): ApiBan {
        const subject = ban.subject as IUser;
        const issuer = ban.issuer as IUser;

        return {
            id: ban.id,
            reason: ban.reason,
            subject: { id: subject.id, username: subject.username },
            issuer: { id: issuer.id, username: issuer.username },
            expiry: ban.expiry as any
        }
    }
}

/**
 * Represents a ban that is to be revoked.
 */
export class ApiRevokeBan {
    @IsDefined()
    id: string;
}