import {Response} from "express";
import build from "@config/build.json";
import {Get, JsonController, Res} from "routing-controllers";
import {Service} from "typedi";

@JsonController("/metadata")
@Service()
export default class MetaDataController {
    public static readonly BUILD_NUMBER_ENDPOINT: string = "/build";

    /**
     * Endpoint to view the current build number.
     * @param response The response.
     */
    @Get(MetaDataController.BUILD_NUMBER_ENDPOINT)
    public getBuild(@Res() response: Response) {
        return response.json(build);
    }
}