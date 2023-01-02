import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser, Get,
    JsonController,
    NotFoundError,
    Post, Put,
    QueryParam
} from "routing-controllers";
import { config } from "@config/config";
import {Service} from "typedi";
import {SessionUser} from "@validation/session/SessionUser";
import {
    DiscussionDoesNotExistError,
    IPrivateDiscussionRepository,
    PrivateDiscussionModel
} from "@models/message/privateDiscussionModel";
import {IUser, IUserRepository, UserDoesNotExistError, UserModel} from "@models/user/userModel";
import {
    ApiCreatePrivateMessage,
    ApiPrivateDiscussion,
    ApiPrivateDiscussionSetUsers
} from "@validation/body/apiPrivateDiscussion";
import SocketService from "@server/services/socketService";
import NotificationService from "@server/services/notificationService";
import { NotificationType } from "@server/models/notification/notificationModel";

@JsonController("/discussion")
@Service()
export default class PrivateDiscussionController {
    public static readonly CREATE_PRIVATE_DISCUSSION_ENDPOINT = "/";
    public static readonly POST_MESSAGE_ENDPOINT = "/message";
    public static readonly SET_USERS_ENDPOINT = "/";
    public static readonly GET_PRIVATE_DISCUSSION = "/";
    public static readonly GET_USERS = "/users";

    public userModel: IUserRepository = UserModel;
    public privateDiscussionModel: IPrivateDiscussionRepository = PrivateDiscussionModel;

    /**
     * Creates a new private discussion controller.
     * @param socketService The socket service (injeced).
     * @param notificationService The notification service (injected).
     */
    constructor(private readonly socketService: SocketService, private readonly notificationService: NotificationService) {}

    /**
     * Endpoint to create a private discussion.
     * @param sessionUser The user who made the request.
     */
    @Post(PrivateDiscussionController.CREATE_PRIVATE_DISCUSSION_ENDPOINT)
    @Authorized()
    public async createPrivateDiscussion(@CurrentUser({ required: true }) sessionUser: SessionUser) {
        const user = await this.userModel.getOne({ id: sessionUser.id });

        if (!user)
            throw new NotFoundError("the given user does not exist");

        const privateDiscussion = await this.privateDiscussionModel.createOne({ host: user._id, users: [user._id] });

        return {
            status: "success",
            discussionId: privateDiscussion.id
        };
    }

    /**
     * Endpoint to send a message within a private discussion.
     * @param sessionUser The user who made the request.
     * @param createPrivateMessage The request body.
     */
    @Post(PrivateDiscussionController.POST_MESSAGE_ENDPOINT)
    @Authorized()
    public async createPrivateMessage(@CurrentUser({ required: true }) sessionUser: SessionUser,
                                      @Body({ required: true }) createPrivateMessage: ApiCreatePrivateMessage) {
        try {
            const message = await this.privateDiscussionModel.createMessage(createPrivateMessage.privateDiscussionId, sessionUser.id, createPrivateMessage.message);
            this.socketService.newPrivateMessage(createPrivateMessage.privateDiscussionId, message);
        } catch (e) {
            if (e instanceof UserDoesNotExistError || e instanceof DiscussionDoesNotExistError)
                throw new NotFoundError(e.message)
            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success"
        };
    }

    /**
     * Endpoint to get a private discussion.
     * @param sessionUser The user who made the request.
     * @param discussionId The ID of the private discussion.
     */
    @Get(PrivateDiscussionController.GET_PRIVATE_DISCUSSION)
    @Authorized()
    public async getPrivateDiscussion(@CurrentUser({ required: true }) sessionUser: SessionUser,
                                      @QueryParam("discussionId", { required: true }) discussionId: string) {
        const discussion = await this.privateDiscussionModel.getPrivateDiscussion(sessionUser.id, discussionId);

        if (!discussion)
            throw new NotFoundError("the given discussion could not be found");

        return {
            status: "success",
            discussion: ApiPrivateDiscussion.createApiPrivateDiscussionFromDocument(discussion)
        };
    }

    /**
     * Endpoint to get a list of users within a private discussion.
     * @param sessionUser The user who made the request.
     * @param discussionId The ID of the discussion.
     */
    @Get(PrivateDiscussionController.GET_USERS)
    @Authorized()
    public async getUsers(@CurrentUser({ required: true }) sessionUser: SessionUser,
                          @QueryParam("discussionId", { required: true }) discussionId: string) {
        const discussion = await this.privateDiscussionModel.getPrivateDiscussion(sessionUser.id, discussionId);

        if (!discussion)
            throw new NotFoundError("the given discussion does not exist");

        return {
            status: "success",
            users: ApiPrivateDiscussion.createApiPrivateDiscussionUsers(discussion)
        };
    }

    /**
     * Endpoint to set the users in a private discussion.
     * @param sessionUser The user who made the request.
     * @param setUsers The request body.
     */
    @Put(PrivateDiscussionController.GET_USERS)
    @Authorized()
    public async setUsers(
        @CurrentUser({ required: true }) sessionUser: SessionUser,
        @Body({ required: true }) setUsers: ApiPrivateDiscussionSetUsers
    ) {
        try {
            const discussion = await this.privateDiscussionModel.getPrivateDiscussion(sessionUser.id, setUsers.discussionId);
            const previousUsers = discussion.users;

            const newUsers = await this.privateDiscussionModel.setUsers(setUsers.discussionId, sessionUser.id, setUsers.users);
            const newDiscussion = await this.privateDiscussionModel.getPrivateDiscussion(sessionUser.id, setUsers.discussionId);

            // find the users who have been added and removed
            const previousUsersSet = new Set(previousUsers.map(u => (u as IUser).id));
            const newUsersSet = new Set(newUsers.map(u => u.id));
            const addedUsers: IUser[] = [];
            const removedUsers: IUser[] = [];
            newUsers.forEach(u => !previousUsersSet.has(u.id) && addedUsers.push(u));
            previousUsers.forEach(u => !newUsersSet.has((u as IUser).id) && removedUsers.push(u as IUser));

            this.socketService.discussionUsersUpdated(newDiscussion, newUsers, addedUsers, removedUsers);

            // send a notification to the users added
            const discussionUrl = `${config.journalUrl}/private_discussion/${discussion.id}`;
            this.notificationService.pushNotificationForUsers('You have been added to a private discussion', addedUsers.map(u => u.id), NotificationType.MISC, discussionUrl);
        } catch (e) {
            if (e instanceof UserDoesNotExistError || e instanceof DiscussionDoesNotExistError)
                throw new NotFoundError(e.message);

            throw new BadRequestError((e as Error).message);
        }

        return {
            status: "success"
        };
    }
}