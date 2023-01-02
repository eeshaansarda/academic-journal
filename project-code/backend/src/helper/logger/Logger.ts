import moment from "moment";
import {Request} from "express";

export enum Level {
    TRACE,
    ERROR,
    WARN
}

export default class Logger {

    /**
     * Returns the current formatted timestamp.
     * @returns The current formatted timestamp.
     */
    private static getTimeStamp(): string {
        return `[${moment().format("DD/MM/YYYY-HH-mm-ss-SSS")}]`;
    }

    /**
     * Logs an object as an error.
     * @param obj The object to be logged.
     */
    private static logError(obj: any): void {
        console.error(`[ERROR]${this.getTimeStamp()}${JSON.stringify(obj, null, 4)}`);
    }

    /**
     * Logs an object as a warning.
     * @param obj The object to be logged.
     */
    private static logWarn(obj: any): void {
        console.warn(`[WARN]${this.getTimeStamp()}${JSON.stringify(obj, null, 4)}`);
    }

    /**
     * Logs an object as a trace.
     * @param obj The object to be logged.
     */
    private static logTrace(obj: any): void {
        console.info(`[INFO]${this.getTimeStamp()}${JSON.stringify(obj, null, 4)}`);
    }

    /**
     * Logs a request.
     * @param request The request.
     */
    public static logRequest(request: Request): void {
        Logger.logTrace({ endpoint: request.url, request: request.body })
    }

    /**
     * Logs an object with a given logging level.
     * @param level The logging level.
     * @param obj The object to log.
     */
    public static prettyLog(level: Level, obj: any): void {
        switch (level) {
            case Level.ERROR:
                this.logError(obj);
                return;
            case Level.TRACE:
                this.logTrace(obj);
                return;
            case Level.WARN:
                this.logWarn(obj);
                return;
        }
    }
}