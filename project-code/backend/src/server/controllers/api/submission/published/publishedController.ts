import {
    Authorized,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Param,
    QueryParams,
    Res
} from "routing-controllers";
import {GetPublicationsQuery} from "@validation/query/getPublicationQuery";
import {ISubmissionRepository, SubmissionModel} from "@models/submission/submissionModel";
import {ApiSubmission} from "@validation/body/apiSubmission";
import {IZipSender, ZipSender} from "@helper/zip/zip";
import {Response} from "express";
import {Service} from "typedi";
import {SessionUser} from "@validation/session/SessionUser";

@JsonController("/submission/published")
@Service()
export default class PublishedController {
    public static readonly GET_FEATURED_SUBMISSIONS = "/featured";
    public static readonly GET_SUBMISSION_OF_THE_DAY = "/submission_of_the_day";
    public static readonly GET_PUBLISHED_SUBMISSIONS = "/";
    public static readonly GET_MY_PUBLISHED_SUBMISSIONS = "/my_publications";
    public static readonly DOWNLOAD_PUBLICATION = "/:publicationId/download";
    public static readonly GET_PUBLICATION_ENDPOINT = "/:publicationId";

    public publicationModel: ISubmissionRepository = SubmissionModel;
    public zipSender: IZipSender = new ZipSender();

    /**
     * Endpoint to get a list of featured submissions.
     */
    @Get(PublishedController.GET_FEATURED_SUBMISSIONS)
    public async getFeaturedSubmissions() {
        const publications = await this.publicationModel.getFeaturedPublications();
        const censoredPublications = publications.map(ApiSubmission.createApiPublicationFromDocument);

        return {
            status: "success",
            publications: censoredPublications
        };
    }

    /**
     * Endpoint to get the submission of the day.
     */
    @Get(PublishedController.GET_SUBMISSION_OF_THE_DAY)
    public async getSubmissionOfTheDay() {
        const publication = await this.publicationModel.getPublicationOfTheDay();

        if (!publication)
            throw new NotFoundError("there are no publications in the system");

        return {
            status: "success",
            publication: ApiSubmission.createApiPublicationFromDocument(publication)
        };
    }

    /**
     * Endpoint to get a list of published submissions.
     * @param publishedSubmissions The query parameters.
     */
    @Get(PublishedController.GET_PUBLISHED_SUBMISSIONS)
    public async getPublishedSubmissions(@QueryParams({ required: true }) publishedSubmissions: GetPublicationsQuery) {
        const [numPublications, publications] = await this.publicationModel.findPublishedByTitle(publishedSubmissions);
        const censoredPublications = publications.map(ApiSubmission.createApiPublicationFromDocument);

        return {
            status: "success",
            publications: censoredPublications,
            numPublications
        };
    }

    /**
     * Endpoint for a user to get a list of their submissions that have
     * been published.
     * @param publishedSubmissions The query parameters.
     * @param sessionUser The user who made the request.
     */
    @Get(PublishedController.GET_MY_PUBLISHED_SUBMISSIONS)
    @Authorized()
    public async getMyPublishedSubmissions(@QueryParams({ required: true }) publishedSubmissions: GetPublicationsQuery,
                                           @CurrentUser({ required: true }) sessionUser: SessionUser) {
        const [numPublications, publications] = await this.publicationModel.findPublishedByTitle({ ...publishedSubmissions, userId: sessionUser.id });
        const censoredPublications = publications.map(ApiSubmission.createApiPublicationFromDocument);

        return {
            status: "success",
            publications: censoredPublications,
            numPublications
        };
    }

    /**
     * Endpoint to download a publication.
     * @param publicationId The ID of the publication.
     * @param response The response.
     */
    @Get(PublishedController.DOWNLOAD_PUBLICATION)
    public async downloadPublication(@Param("publicationId") publicationId: string,
                                     @Res() response: Response) {
        const publication = await this.publicationModel.getPublication(publicationId);

        if (!publication)
            throw new NotFoundError("the given publication does not exist");

        try {
            await publication.performValidation();
        } catch (e) {
            throw new NotFoundError("the given publication does not exist");
        }

        await this.zipSender.sendZip(publication.getPath(), publication, response);
        return response;
    }

    /**
     * Endpoint to get a specific publication.
     * @param publicationId The ID of the publication.
     */
    @Get(PublishedController.GET_PUBLICATION_ENDPOINT)
    public async getPublication(@Param("publicationId") publicationId: string) {
        const publication = await this.publicationModel.getPublication(publicationId);

        if (!publication)
            throw new NotFoundError("the given publication does not exist");

        publication.stats.publishedVisits++;
        await publication.save();

        return {
            status: "success",
            publication: ApiSubmission.createApiSubmissionFromDocument(publication),
        };
    }
}