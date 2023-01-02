import {Action} from 'routing-controllers';
import {SessionUser} from "@validation/session/SessionUser";

/**
 * Returns the current user associated with a request.
 * @param action The 'action' object. Contains the request.
 * @returns The user associated with the request.
 */
export function currentUserChecker(action: Action): SessionUser | undefined {
    return (action.request as any).user as SessionUser;
}

