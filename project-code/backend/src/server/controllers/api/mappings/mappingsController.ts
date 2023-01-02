import {Response} from "express";
import { sgMappings } from "@config/super_groups.json";
import {Get, JsonController, Res} from "routing-controllers";
import {Service} from "typedi";

@JsonController("/mappings")
@Service()
export default class MappingsController {

    public static readonly GET_SUPERGROUP_MAPPING_ENDPOINT = "/sg";

    /**
     * Endpoint to get the supergroup mappings.
     * @param res The response.
     */
    @Get(MappingsController.GET_SUPERGROUP_MAPPING_ENDPOINT)
    public superGroupMappings(@Res() res: Response) {
        const mappings = sgMappings as {[key: string]: string};
        for (const [key, value] of Object.entries(mappings)) {
            if (value.endsWith('/')) {
                mappings[key] = value.slice(0, -1);
            }
        }
        return res.json(sgMappings);
    }
}