import {Response} from 'express';
import {IUser, IUserRepository, UserModel, UserRole} from '@models/user/userModel';
import {
    CookieProvider,
    createCookieResponse,
    generateSessionCookie,
    ICookieProvider
} from "@server/authorization/authorization";
import { config } from "@config/config";
import {ServerError} from "@server/errors/serverError";
import {SESSION_COOKIE_NAME} from "@config/cookies";
import {BanModel, IBanRepository} from '@models/ban/banModel';
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Param,
    Post, Put,
    QueryParams,
    Res,
    UnauthorizedError,
    UploadedFile
} from "routing-controllers";
import {SessionUser} from "@validation/session/SessionUser";
import {ApiLoginUser, ApiRegisterUser, ApiUser, PublicApiUser} from "@validation/body/apiUser";
import {ApiAddRole} from "@validation/body/apiRole";
import {ApiChangePassword} from "@server/validation/body/apiChangePassword";
import multer from 'multer';
import path from 'path';
import { promisify } from 'util';
import {FileUtilities, IFileUtilities} from '@helper/path/path';
import { GetProfilePictureQuery } from '@server/validation/query/getProfilePictureQuery';
import { ApiChangeFieldVisibility } from '@server/validation/body/apiChangeFieldVisibility';
import { ApiChangeFields } from '@server/validation/body/apiChangeFields';
import { ApiInitiateForgottenPassword } from '@server/validation/body/apiInitiateForgottenPassword';
import { ApiCompleteForgottenPassword } from '@server/validation/body/apiCompleteForgottenPassword';
import { ForgottenPasswordData, ForgottenPasswordToken } from '@helper/email/forgottenPasswordToken';
import {Service} from "typedi";
import EmailService from '@server/services/emailService';
import { EmailVerificationData, EmailVerificationToken } from '@helper/email/emailVerificationToken';
import { ApiVerifyEmail } from '@server/validation/body/apiVerifyEmail';
import DecryptionService from '@server/services/decryptionService';
import { ApiEncryptedBody } from '@server/validation/body/apiEncryptedBody';
import {URL} from "url";
import NotificationService from '@server/services/notificationService';
import { NotificationType } from '@server/models/notification/notificationModel';
import SocketService from '@server/services/socketService';
import {transformAndValidate} from "class-transformer-validator";

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpeg', '.jpg']);

/**
 * Disk storage object that marks the profile picture as belonging
 * to the user that uploaded it.
 */
const profilePictureStorage = multer.diskStorage({
    destination: config.profilePictureFolder,
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        if (!SUPPORTED_EXTENSIONS.has(extension)) {
            return cb(new Error(`Unsupported file type ${extension}`), '');
        }

        const user = (req as any).user as SessionUser;

        const fileName = `${user.id}${extension}`;
        file.filename = fileName;

        return cb(null, fileName);
    }
});

@JsonController("/user")
@Service()
export default class UserController {
    public static readonly DETAILS_ENDPOINT = "/details";
    public static readonly PROFILE_ENDPOINT = "/profile/:id";
    public static readonly PROFILE_PICTURE_ENDPOINT = "/profile_picture";
    public static readonly LOGIN_ENDPOINT = "/login";
    public static readonly REGISTER_ENDPOINT = "/register";
    public static readonly CHANGE_PASSWORD_ENDPOINT = "/change_password";
    public static readonly CHANGE_PROFILE_PICTURE_ENDPOINT = "/change_profile_picture";
    public static readonly CHANGE_PROFILE_FIELDS_ENDPOINT = "/change_profile_fields";
    public static readonly CHANGE_PROFILE_FIELD_VISIBILITY_ENDPOINT = "/change_profile_visibility";
    public static readonly CHANGE_ROLE_ENDPOINT = "/add_role";
    public static readonly SEND_EMAIL_VERIFICATION = "/send_email_verification";
    public static readonly INITIATE_FORGOTTEN_PASSWORD_ENDPOINT = "/initiate_forgotten_password";
    public static readonly COMPLETE_FORGOTTEN_PASSWORD_ENDPOINT = "/complete_forgotten_password";
    public static readonly VERIFY_EMAIL_ENDPOINT = "/verify_email";
    public static readonly LOGOUT_ENDPOINT = "/logout";

    public static readonly MAX_PROFILE_PICTURE_SIZE = 1024 * 1024;

    public userModel: IUserRepository = UserModel;
    public banModel: IBanRepository = BanModel;
    public cookieProvider: ICookieProvider = new CookieProvider();
    public fileUtilities: IFileUtilities = new FileUtilities();

    /**
     * Creates a new user controller.
     * @param emailService The email service (injected).
     * @param decryptionService The decryption service (injected).
     * @param notificationService The notification service (injected).
     * @param socketService The socket service (injecteed).
     */
    constructor(private emailService: EmailService, private decryptionService: DecryptionService, private notificationService: NotificationService, private socketService: SocketService) {
        this.emailService ??= new EmailService();
        this.decryptionService ??= new DecryptionService();
        this.socketService ??= new SocketService();
        this.notificationService ??= new NotificationService(socketService);
    }

    /**
     * Endpoint to get a user's details.
     * @param user The user who made the request.
     */
    @Authorized()
    @Get(UserController.DETAILS_ENDPOINT)
    public async getDetails(@CurrentUser({ required: true }) user: SessionUser) {
        const userModel = await this.userModel.getUserFromId(user.id);
        if (!userModel) {
            throw new NotFoundError('User not found');
        }

        return {
            status: 'success',
            details: {
                id: userModel.id,
                username: userModel.username,
                email: userModel.email,
                firstName: userModel.firstName,
                lastName: userModel.lastName,
                role: userModel.role,
                hasVerifiedEmail: userModel.hasVerifiedEmail,
                profile: userModel.profile,
                homeJournal: userModel.journalInfo.homeJournal
            }
        };
    }

    /**
     * Endpoint to get a user's profile details.
     * @param userId The ID of the user.
     */
    @Get(UserController.PROFILE_ENDPOINT)
    public async viewProfile(
        @Param('id') userId: string
    ) {
        const userModel = await this.userModel.getUserFromId(userId);
        if (!userModel) {
            throw new NotFoundError('User not found');
        }

        return {
            status: 'success',
            details: {
                ...PublicApiUser.createPublicApiUserFromDocument(userModel)
            }
        };
    }

    /**
     * Endpoint to get a user's profile picture.
     * @param user The user who made the request.
     * @param query The query parameters.
     * @param res The response.
     */
    @Get(UserController.PROFILE_PICTURE_ENDPOINT)
    @Authorized()
    public async getProfilePicture(
        @CurrentUser({ required: false }) user: SessionUser,
        @QueryParams() query: GetProfilePictureQuery,
        @Res() res: Response
    ) {
        const id = query.userId || user.id;
        if (!id) {
            throw new BadRequestError("You must be logged in or specify a user ID");
        }

        const userModel = await this.userModel.getUserFromId(id);
        if (!userModel) {
            throw new BadRequestError('User not found');
        }

        if (!userModel.profile.profilePicture.url) {
            throw new NotFoundError('User has not provided a profile picture');
        }

        if (!userModel.profile.profilePicture.url.startsWith(config.journalUrl)) {
            res.redirect(userModel.profile.profilePicture.url);
            return res;
        }

        if (!userModel.profile.fieldVisibility.profilePicture) {
            throw new UnauthorizedError("User's profile picture is not public");
        }

        if (!userModel.profile.profilePicture.fileType) {
            throw new ServerError("file could not be located on the server");
        }

        const filePath = path.join(process.cwd(), `${config.profilePictureFolder}/${userModel.id}${userModel.profile.profilePicture.fileType}`);
        if (await this.fileUtilities.fileExists(filePath)) {
            await promisify<string, void>(res.sendFile.bind(res))(filePath);
            return res;
        } else {
            throw new NotFoundError('Profile picture not found');
        }
    }

    /**
     * Endpoint for a user to login.
     * @param body The request body.
     * @param response The response.
     */
    @Post(UserController.LOGIN_ENDPOINT)
    public async login(
        @Body() body: ApiEncryptedBody,
        @Res() response: Response
    ) {
        const decryptedBody = this.decryptionService.decrypt(body.data);
        const loginDetails = JSON.parse(decryptedBody) as ApiLoginUser;
        await transformAndValidate(ApiLoginUser, loginDetails);

        const userModel = await this.userModel.getHomeUserFromEmail(loginDetails.email);

        if (!userModel || !userModel.isHomeUser())
            throw new BadRequestError("Invalid email or password");

        const bans = await userModel.getBans();

        if (bans.length !== 0) {
            let ban = bans[0];
            const reason = ban.reason ?? 'unknown';
            const expiry = (ban.expiry as any)?.toUTCString() ?? 'unknown';
            throw new UnauthorizedError(`You are banned for "${reason}" until ${expiry}`);
        }

        if (await userModel.checkPassword(loginDetails.password)) {
            let sessionCookie: string;

            try {
                sessionCookie = await generateSessionCookie(ApiUser.createApiUserFromDocument(userModel));
            } catch (err) {
                throw new ServerError("Unable to create access token");
            }

            return createCookieResponse(response, sessionCookie)
                .status(200)
                .send({
                    status: "success"
                });
        }
        throw new BadRequestError("Invalid email or password");
    }

    /**
     * Endpoint for a user to register.
     * @param body The request body.
     * @param response The response.
     */
    @Post(UserController.REGISTER_ENDPOINT)
    public async register(
        @Body() body: ApiEncryptedBody,
        @Res() response: Response
    ) {
        const decryptedBody = this.decryptionService.decrypt(body.data);
        const newUser = JSON.parse(decryptedBody) as ApiRegisterUser;
        await transformAndValidate(ApiRegisterUser, newUser);

        if (await this.userModel.doesHomeUserExist(newUser.email)) {
            throw new BadRequestError("A user with that email already exists");
        }

        const userModel = await this.userModel.createHomeUser(newUser, newUser.password);

        let sessionCookie: string;
        try {
            sessionCookie = await this.cookieProvider.genSessionCookie(ApiUser.createApiUserFromDocument(userModel));
        } catch (error) {
            throw new ServerError("Unable to generate session cookie");
        }

        // ask user to verify their email after registering
        await this.sendVerificationEmail(userModel);
        this.notificationService.pushNotification('Please verify your email address, an email has been sent',
            userModel.id, NotificationType.MISC);

        this.cookieProvider.createSessionCookie(response, sessionCookie).send({
            status: "success"
        });
    }

    /**
     * Endpoint for a user to change their password.
     * @param body The request body.
     * @param user The user who made the request.
     * @param response The response.
     */
    @Post(UserController.CHANGE_PASSWORD_ENDPOINT)
    @Authorized()
    public async changePassword(
        @Body() body: ApiEncryptedBody,
        @CurrentUser({ required: true }) user: SessionUser,
        @Res() response: Response
    ) {
        const decryptedBody = this.decryptionService.decrypt(body.data);
        const changePassword = JSON.parse(decryptedBody) as ApiChangePassword;
        await transformAndValidate(ApiChangePassword, changePassword);

        const userModel = await this.userModel.getUserFromId(user.id);

        if (!userModel || !userModel.isHomeUser()) {
            throw new BadRequestError("User is not signed in");
        }

        if (await userModel.checkPassword(changePassword.currentPassword)) {
            userModel.password = changePassword.newPassword;
            await userModel.save();

            // kick all sessions back to login
            await this.socketService.clearSessions(userModel.id);

            // log the user out after their password has been changed
            return this.cookieProvider.clearCookie(response, SESSION_COOKIE_NAME).send({
                status: "success"
            });
        }
        throw new BadRequestError("the password is not valid");
    }

    /**
     * Endpoint for a user to change their profile picture.
     * @param user The user who made the request.
     * @param file The profile picture file attached to the request.
     */
    @Post(UserController.CHANGE_PROFILE_PICTURE_ENDPOINT)
    @Authorized()
    public async changeProfilePicture(
        @CurrentUser({ required: true }) user: SessionUser,
        @UploadedFile('picture', { options: { storage: profilePictureStorage,
                limits: { fileSize: UserController.MAX_PROFILE_PICTURE_SIZE } }, required: true, }) file: any
    ) {
        const userModel = await this.userModel.getUserFromId(user.id);
        if (!userModel) {
            throw new BadRequestError('User is not signed in');
        }

        const profileUrl = new URL(`${UserController.PROFILE_PICTURE_ENDPOINT}?userId=${user.id}`, config.journalUrl);

        userModel.profile.profilePicture.url = profileUrl.toString();
        userModel.profile.profilePicture.fileType = path.extname(file.filename);
        await userModel.save();

        return {
            status: 'success'
        };
    }

    /**
     * Endpoint for a user to change the fields in their profile.
     * @param user The user who made the request.
     * @param body The request body.
     */
    @Post(UserController.CHANGE_PROFILE_FIELDS_ENDPOINT)
    @Authorized()
    public async changeProfileFields(
        @CurrentUser({ required: true }) user: SessionUser,
        @Body() body: ApiChangeFields
    ) {
        const userModel = await this.userModel.getUserFromId(user.id);
        if (!userModel) {
            throw new BadRequestError("User is not signed in");
        }

        if (body.email) {
            userModel.email = body.email;
        }
        if (body.firstName) {
            userModel.firstName = body.firstName;
        }
        if (body.lastName) {
            userModel.lastName = body.lastName;
        }
        if (body.biography) {
            userModel.profile.biography = body.biography;
        }
        if (body.institution) {
            userModel.profile.institution = body.institution;
        }
        if (body.twitter && (!body.twitter.startsWith('http') || !body.twitter.includes('twitter.com'))) {
            throw new BadRequestError(`Twitter link must be a valid Twitter account URL`);
        }
        userModel.profile.socialMedia.twitter = body.twitter || '';
        if (body.facebook && (!body.facebook.startsWith('http') || !body.facebook.includes('facebook.com'))) {
            throw new BadRequestError(`Facebook link must be a valid Facebook profile URL`);
        }
        userModel.profile.socialMedia.facebook = body.facebook || '';
        if (body.linkedIn && (!body.linkedIn.startsWith('http') || !body.linkedIn.includes('linkedin.com'))) {
            throw new BadRequestError(`LinkedIn link must be a valid LinkedIn profile URL`);
        }
        userModel.profile.socialMedia.linkedIn = body.linkedIn || '';
        
        await userModel.save();

        return {
            status: "success"
        };
    }

    /**
     * Endpoint for a user to change the visibility of the fields in their
     * profile.
     * @param user The user who made the request.
     * @param body The request body.
     */
    @Post(UserController.CHANGE_PROFILE_FIELD_VISIBILITY_ENDPOINT)
    @Authorized()
    public async changeProfileFieldVisibility(
        @CurrentUser({ required: true }) user: SessionUser,
        @Body() body: ApiChangeFieldVisibility
    ) {
        const userModel = await this.userModel.getUserFromId(user.id);
        if (!userModel) {
            throw new BadRequestError("User is not signed in");
        }

        userModel.profile.fieldVisibility[body.field] = body.visible;
        await userModel.save();

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to trigger an email verification link to be sent to a user.
     * @param user The user who made the request.
     */
    @Post(UserController.SEND_EMAIL_VERIFICATION)
    @Authorized()
    public async sendEmailVerification(
        @CurrentUser({ required: true }) user: SessionUser
    ) {
        const userModel = await this.userModel.getUserFromId(user.id);
        if (!userModel) {
            throw new BadRequestError("User is not signed in");
        }

        if (!userModel.isHomeUser()) {
            throw new BadRequestError("User is not a home user");
        }

        const sentEmail = await this.sendVerificationEmail(userModel);

        return {
            status: sentEmail ? 'success' : 'failure'
        };
    }

    /**
     * Endpoint to change another user's role. Admin only.
     * @param role The request body.
     */
    @Put(UserController.CHANGE_ROLE_ENDPOINT)
    @Authorized(UserRole.ADMIN)
    public async setRole(
        @Body() role: ApiAddRole
    ) {
        const userModel = await this.userModel.getUserFromId(role.userId);
        if (!userModel)
            throw new NotFoundError("Could not find the user");

        userModel.role = role.role;
        await userModel.save();

        // force all users to log back in and reload their role
        this.socketService.clearSessions(userModel.id);

        return {
            status: "success"
        };
    }

    /**
     * Endpoint for a user to logout.
     * @param response The response.
     */
    @Post(UserController.LOGOUT_ENDPOINT)
    @Authorized()
    public logout(@Res() response: Response) {
        return this.cookieProvider.clearCookie(response, SESSION_COOKIE_NAME).send({
            status: "success"
        });
    }

    /**
     * Endpoint for a user to begin the forgotten password process.
     * @param body The request body.
     */
    @Post(UserController.INITIATE_FORGOTTEN_PASSWORD_ENDPOINT)
    public async initiateForgottenPassword(
        @Body() body: ApiInitiateForgottenPassword
    ) {
        const userModel = await this.userModel.getHomeUserFromEmail(body.email);
        if (!userModel) {
            throw new BadRequestError("User does not exist");
        }

        if (!userModel.isHomeUser()) {
            throw new BadRequestError("the user is not a home user");
        }

        const token = await ForgottenPasswordToken.generate(userModel);
        const resetPasswordLink = `${config.journalUrl}/complete_forgotten_password?id=${userModel.id}&token=${token}`;

        const emailContent = `
        <h1>Reset Password</h1>
        <p>
            Click the following link to reset your password:<br/>
            ${resetPasswordLink}
        </p>

        <p>
            Note that the link expires in 10 minutes.
        </p>
        `;
        const sentEmail = await this.emailService.sendEmail(userModel.email, 'Reset Your Password', emailContent);

        if (sentEmail) {
            return {
                status: 'success'
            };
        } else {
            throw new ServerError("failed to send email");
        }
    }

    /**
     * Endpoint for a user to complete the forgotten password process.
     * @param body The request body.
     */
    @Post(UserController.COMPLETE_FORGOTTEN_PASSWORD_ENDPOINT)
    public async completeForgottenPassword(
        @Body() body: ApiEncryptedBody
    ) {
        const decryptedBody = this.decryptionService.decrypt(body.data);
        const payload = JSON.parse(decryptedBody) as ApiCompleteForgottenPassword;
        await transformAndValidate(ApiCompleteForgottenPassword, payload);
        const userModel = await this.userModel.getUserFromId(payload.id);
        if (!userModel) {
            throw new BadRequestError("User does not exist");
        }

        if (!userModel.isHomeUser())
            throw new BadRequestError("The user is not a home user");

        let data: ForgottenPasswordData;
        try {
            data = await ForgottenPasswordToken.decode(payload.token);
        } catch (err) {
            throw new BadRequestError('Password reset link is invalid or expired');
        }

        // ensure id matches user id
        if (data.id !== userModel.id) {
            throw new BadRequestError('Malformed password reset link');
        }

        userModel.password = payload.newPassword;
        await userModel.save();

        return {
            status: "success"
        };
    }

    /**
     * Endpoint for a user to verify their email address.
     * @param body The request body.
     */
    @Post(UserController.VERIFY_EMAIL_ENDPOINT)
    public async verifyEmail(
        @Body() body: ApiVerifyEmail
    ) {
        const userModel = await this.userModel.getUserFromId(body.id);
        if (!userModel) {
            throw new BadRequestError("User does not exist");
        }

        if (!userModel.isHomeUser()) {
            throw new BadRequestError("the user is not a home user");
        }

        let data: EmailVerificationData;
        try {
            data = await EmailVerificationToken.decode(body.token);
        } catch (err) {
            throw new BadRequestError('Email verification link is invalid or expired');
        }

        // ensure id and email match
        if (data.id !== userModel.id || data.email !== userModel.email) {
            throw new BadRequestError('Malformed email verification link');
        }

        userModel.hasVerifiedEmail = true;
        await userModel.save();

        return {
            status: "success"
        };
    }

    /**
     * Sends an email to verify a user's email.
     * @param userModel The user.
     * @returns Whether the email was sent.
     */
    private async sendVerificationEmail(userModel: IUser): Promise<boolean> {
        const token = await EmailVerificationToken.generate(userModel);
        const verifyEmailLink = `${config.journalUrl}/verify_email?id=${userModel.id}&token=${token}`;

        const emailContent = `
        <h1>Verify Email</h1>
        <p>
            Click the following link to verify your email:<br/>
            ${verifyEmailLink}
        </p>

        <p>
            If you did not request an email verification simply ignore this email.
        </p>

        <p>
            Note that the link expires in 7 days.
        </p>
        `;
        return await this.emailService.sendEmail(userModel.email, 'Verify Your Email', emailContent);
    }
}