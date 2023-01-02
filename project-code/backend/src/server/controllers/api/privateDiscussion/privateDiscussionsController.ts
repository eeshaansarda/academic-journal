import {Authorized, CurrentUser, Get, JsonController, QueryParams} from "routing-controllers";
import {Service} from "typedi";
import {SessionUser} from "@validation/session/SessionUser";
import {IPrivateDiscussionRepository, PrivateDiscussionModel} from "@models/message/privateDiscussionModel";
import {IUser} from "@models/user/userModel";
import {GetPrivateDiscussions} from "@validation/query/getPrivateDiscussionQuery";

@JsonController("/discussions")
@Service()
export default class PrivateDiscussionsController {
    public static readonly GET_PRIVATE_DISCUSSIONS = "/";

    public privateDiscussionModel: IPrivateDiscussionRepository = PrivateDiscussionModel;

    /**
     * Endpoint to get a list of private discussions for a user.
     * @param sessionUser The user who made the request.
     * @param getPrivateDiscussions The query parameters.
     */
    @Get(PrivateDiscussionsController.GET_PRIVATE_DISCUSSIONS)
    @Authorized()
    public async getPrivateDiscussions(@CurrentUser({ required: true }) sessionUser: SessionUser,
                                       @QueryParams({ required: true }) getPrivateDiscussions: GetPrivateDiscussions) {
        const discussions = await this.privateDiscussionModel.getPrivateDiscussionsForUser(sessionUser.id, getPrivateDiscussions.pageNumber);

        return {
            status: "success",
            discussions: discussions.map(discussion => ({
                id: discussion.id,
                host: { username: (discussion.host as IUser).username, id: (discussion.host as IUser).id },
                users: (discussion.users as IUser[]).map(user => ({ username: user.username, id: user.id }))
            })),
            numDiscussions: await this.privateDiscussionModel.numDocumentsForUser(sessionUser.id)
        };
    }
}