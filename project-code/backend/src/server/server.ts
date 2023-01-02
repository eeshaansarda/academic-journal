// NOTE: MAKE SURE THAT THIS IS THE ROOT MOST IMPORT OTHERWISE VALIDATION WILL NOT WORK
import "reflect-metadata"
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import {AuthorizationChecker} from "routing-controllers/types/AuthorizationChecker";
import {CurrentUserChecker} from "routing-controllers/types/CurrentUserChecker";
import {currentUserChecker} from "@server/auth/currentUserChecker";
import checkAuth from "@server/auth/authorizationChecker";
import {useExpressServer} from "routing-controllers";
import ErrorHandlerMiddleware from "@middleware/error/errorHandlerMiddleware";
import path from "path";
import morgan from "morgan";
import {Request, Response} from "express";
import {IConfig} from "@config/config";
import UserController from "@controllers/api/user/userController";
import UsersController from "@controllers/api/user/usersController";
import PublicationController from "@controllers/api/superGroup/export/publication/publicationController";
import BanController from "@controllers/api/ban/banController";
import MappingsController from "@controllers/api/mappings/mappingsController";
import MetaDataController from "@controllers/api/metadata/metaDataController";
import ReportController from "@controllers/api/report/reportController";
import SubmissionController from "@controllers/api/submission/submissionController";
import SubmissionsController from "@controllers/api/submission/submissionsController";
import ReviewController from "@controllers/api/submission/review/reviewController";
import ReviewsController from "@controllers/api/submission/review/reviewsController";
import CommentController from "@controllers/api/submission/comment/commentController";
import ImportController from "@controllers/api/superGroup/import/importController";
import SsoController from "@controllers/api/superGroup/sso/ssoController";
import SGUsersController from "@controllers/api/superGroup/users/sgUsersController";
import PublishedController from "@controllers/api/submission/published/publishedController";
import DashboardController from "@controllers/api/user/dashboard/dashboardController";
import SupportingDocumentsController from "@controllers/api/submission/supportingDocument/supportingDocumentController";
import NotificationController from "@controllers/api/notification/notificationController";
import PrivateDiscussionController from "@controllers/api/privateDiscussion/privateDiscussionController";
import PrivateDiscussionsController from "@controllers/api/privateDiscussion/privateDiscussionsController";
import AnnouncementsController from "@controllers/api/announcement/announcementsController";
import AnnouncementController from "@controllers/api/announcement/announcementController";
import Container from "typedi";
import SocketService from "./services/socketService";
import BanService from "@server/services/banService";
import SessionUserMiddleware from "@middleware/user/sessionUser";
import PublishedService from "@server/services/publishedService";
import ThemeController from "@controllers/api/user/theme/themeController";

require('express-async-errors');

export default class Server {
    private readonly app: express.Express;
    private readonly port: string | number;
    private readonly authorizationChecker: AuthorizationChecker;
    private readonly currentUserChecker: CurrentUserChecker;
    private readonly middlewares: Function[];
    private readonly config: IConfig;

    public static server?: http.Server;

    private readonly controllers = [
        UserController,
        UsersController,
        PublicationController,
        BanController,
        MappingsController,
        MetaDataController,
        ReportController,
        SubmissionController,
        SubmissionsController,
        ReviewController,
        ReviewsController,
        CommentController,
        PublicationController,
        ImportController,
        SsoController,
        SGUsersController,
        PublishedController,
        DashboardController,
        SupportingDocumentsController,
        NotificationController,
        AnnouncementsController,
        AnnouncementController,
        NotificationController,
        PrivateDiscussionController,
        PrivateDiscussionsController,
        ThemeController
    ];

    /**
     * Creates a new server.
     * @param config The config.
     */
    constructor(config: IConfig) {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.middlewares = [
            ErrorHandlerMiddleware,
            SessionUserMiddleware
        ];

        this.currentUserChecker = currentUserChecker;
        this.authorizationChecker = checkAuth;
        this.authorizationChecker = checkAuth;
        this.config = config;

        this.setUp();
    }

    /**
     * Starts the server listening on the designated port.
     */
    public async start() {
        if (!Server.server) {
            throw new Error('Server not set up');
        }

        await this.startMongo();
        Server.server.listen(this.port,  () => {
            console.log(`Server listening on port ${this.port}`);
        });
    }

    /**
     * Sets up the server and middleware.
     */
    private setUp() {
        Server.server = http.createServer(this.app);
        this.app.use(cookieParser());

        if (this.config.logging) {
            this.app.use(morgan('combined', {
                skip(req: Request, res: Response) {
                    return res.statusCode < 400;
                }
            }));
        }

        useExpressServer(this.app, {
            cors: {
                origin: this.config.backendUrl, // backend url different from journal url. These two are needed in development
                                                // as our frontend is served on a different port to the backend
                credentials: true
            },
            defaultErrorHandler: false,
            controllers: this.controllers,
            authorizationChecker: this.authorizationChecker,
            currentUserChecker: this.currentUserChecker,
            validation: true,
            middlewares: this.middlewares,
            defaults: {
                paramOptions: {
                    required: true
                }
            },
            routePrefix: '/api'
        });
        
        this.app.use(express.static(path.join(__dirname, this.config.buildDirectory)));
        this.app.get('*', (req, res) => {
            if (!res.writableEnded) {
                res.sendFile(path.join(__dirname, this.config.buildDirectory, 'index.html'));
            }
        });

        this.registerServices();
    }

    /**
     * Registers needed services immediately (opposed to lazy loading)
     * to prevent webpack from throwing errors in development mode.
     */
    private registerServices() {
        Container.get(SocketService);
        Container.get(BanService);
        Container.get(PublishedService);
    }

    /**
     * Starts the MongoDB server.
     */
    public async startMongo() {
        await mongoose.connect(this.config.dbUrl);
    }

    /**
     * Stops the server.
     */
    stop(callback?: () => void): void {
        if (!Server.server) {
            throw new Error('Server is not running');
        }
        
        Server.server.close(callback);
        Server.server = undefined;
    }

    /**
     * Getter for the Express app.
     * @returns The Express app.
     */
    getApp() {
        return this.app;
    }
}