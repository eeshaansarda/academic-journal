import {IUserRepository, UserModel} from "@models/user/userModel";
import {Authorized, Get, JsonController, QueryParams} from "routing-controllers";
import {UsersQuery} from "@validation/query/usersQuery";
import {PublicApiUser} from "@validation/body/apiUser";
import {instanceToPlain} from "class-transformer";
import {Service} from "typedi";

@JsonController("/users")
@Service()
export default class UsersController {
    private static readonly GET_USERS_ENDPOINT = '/';
    
    public userModel: IUserRepository = UserModel;

    /**
     * Endpoint to get a list of users.
     * @param usersQuery The query parameters.
     */
    @Authorized()
    @Get(UsersController.GET_USERS_ENDPOINT)
    public async getUsers(@QueryParams() usersQuery: UsersQuery) {
        const [numUsers, users] = await this.userModel.getUsers(usersQuery);
        const apiUsers = users.map(user => instanceToPlain(PublicApiUser.createPublicApiUserFromDocument(user),
            { excludeExtraneousValues: true }));

        return {
            status: "success",
            users: apiUsers,
            numUsers
        };
    }
}