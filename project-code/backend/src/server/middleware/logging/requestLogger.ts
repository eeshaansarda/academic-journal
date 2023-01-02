import {ExpressMiddlewareInterface, Middleware} from "routing-controllers";
import {Service} from "typedi";
import Logger from "@helper/logger/Logger";

@Middleware({ type: 'before' })
@Service()
export default class RequestLoggingMiddleware implements ExpressMiddlewareInterface{
    
    /**
     * Logs a request.
     * @param request The request.
     * @param response The response.
     * @param next The 'next' function in the pipeline.
     */
    use(request: any, response: any, next: (err?: any) => any): any {
        Logger.logRequest(request);
        next();
    }
}