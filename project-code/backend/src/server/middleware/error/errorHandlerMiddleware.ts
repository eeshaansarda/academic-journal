import { ValidationError } from "class-validator";
import { Request, Response } from "express";
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import {Service} from "typedi";

@Middleware({ type: 'after' })
@Service()
export default class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {

    /**
     * Handles all uncaught exceptions that are thrown when processing
     * client requests. Sends the errors in a readable format to the client.
     * @param error The error.
     * @param req The request.
     * @param res The response.
     * @param next The 'next' function in the pipeline.
     */
    async error(
        error: any,
        req: Request,
        res: Response,
        next: () => any
    ): Promise<void> {
        const message = error.message;
        const toSend: any = {
            status: 'failure',
            reason: message
        };

        const validationErrors = error.errors 
            ? getValidationErrors(error.errors)
            : null;
        if (validationErrors) {
            toSend.errors = validationErrors;
        }

        if (!res.headersSent) {
            res.status(error.httpCode ?? 400).send(toSend);
        }
        next();
    }
}

/**
 * Extracts error objects from an array of errors.
 * @param errors The array of errors.
 * @returns The error objects or null if the given object is not a valid 
 * error array.
 */
function getValidationErrors(errors: any[]) {
    if (errors.constructor.name !== 'Array')
        return null;

    let validationErrors = errors.filter(error => error instanceof ValidationError) as ValidationError[];
    return validationErrors.map(error => ({ property: error.property, constraints: error.constraints }));
}