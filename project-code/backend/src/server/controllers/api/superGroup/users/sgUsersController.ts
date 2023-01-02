import { config } from "@config/config";
import {IUserRepository, UserModel} from "@models/user/userModel";
import {BadRequestError, Get, JsonController, NotFoundError, Param} from "routing-controllers";
import {ApiUser} from "@validation/body/apiUser";
import {Service} from "typedi";

@JsonController("/sg/users")
@Service()
export default class SGUsersController {
    public static GET_USERS_ENDPOINT = "/:id";

    public userModel: IUserRepository = UserModel;

    /**
     * Gets the name of a journal from their supergroup journal ID.
     * @param superGroup The supergroup journal ID.
     * @returns The name of the journal.
     */
    private static getJournalName(superGroup: string) {
        return superGroup.slice(-3);
    }

    /**
     * Endpoint to get a list of users in the supergroup format.
     * @param id The ID of the supergroup journal.
     */
    @Get(SGUsersController.GET_USERS_ENDPOINT)
    public async getUser(@Param("id") id: string) {
        const superGroupId = SGUsersController.getJournalName(id);

        if (superGroupId !== config.journalId) {
            throw new BadRequestError("Malformed request");
        }

        const user = await this.userModel.getOne({ id });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const apiUser = ApiUser.createApiUserFromDocument(user);

        return {
            status: "ok",
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            email: apiUser.email,
            id: apiUser.id,
            profilePictureUrl: `${config.journalUrl}/api/user/profile_picture?userId=${apiUser.id}`
        };
    }
}