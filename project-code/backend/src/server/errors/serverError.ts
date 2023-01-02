import {HttpError} from "routing-controllers";

export class ServerError extends HttpError {

    /**
     * Creates a new server error.
     * @param msg The error message.
     */
    constructor(msg: string) {
        super(500, msg);
    }
}