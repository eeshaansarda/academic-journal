import {IsDefined} from "class-validator";

/**
 * Represents query parameters to login as an SSO user.
 */
export class SsoLoginQuery {
    @IsDefined()
    from: string;

    @IsDefined()
    state: string;
}

/**
 * Represents query parameters to confirm a SSO login.
 */
export class SsoConfirmQuery {
    @IsDefined()
    redirectUrl: string;

    @IsDefined()
    state: string;
}

/**
 * Represents query parameters of an SSO callback.
 */
export class SsoCallbackQuery {
    @IsDefined()
    token: string;

    @IsDefined()
    state: string;

    @IsDefined()
    from: string;
}