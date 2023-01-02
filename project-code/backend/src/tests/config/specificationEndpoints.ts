export const REGISTER_ENDPOINT = "/api/user/register";
export const LOGIN_ENDPOINT = "/api/user/login";
export const ADD_ROLE_ENDPOINT = "/api/user/add_role";
export const LOGOUT_ENDPOINT = "/api/user/logout";
export const GET_DETAILS_ENDPOINT = "/api/user/details";
export const GET_PUBLIC_PROFILE_ENDPOINT = "/api/user/profile/:id";
export const CHANGE_PASSWORD_ENDPOINT = "/api/user/change_password";
export const CHANGE_FIELDS_ENDPOINT = "/api/user/change_profile_fields";
export const CHANGE_PROFILE_VISIBILITY = "/api/user/change_profile_visibility";

export const UPLOAD_ENDPOINT = "/api/submission/upload";
export const DOWNLOAD_ENDPOINT = "/api/submission/download";
export const EXPORT_ENDPOINT = "/api/submission/export";
export const GET_FILE_ENDPOINT = "/api/submission/file";
export const GET_ENTRIES_ENDPOINT = "/api/submission/getdents";
export const GET_SUBMISSION_METADATA = "/api/submission/";
export const GET_REVIEWS = "/api/submission/reviews";
export const ASSIGN_REVIEWERS = "/api/submission/assign_reviewers";
export const ASSIGN_CO_AUTHORS = "/api/submission/assign_coauthors";
export const PUBLISH_SUBMISSION = "/api/submission/publish";
export const INCREMENT_VERSION = "/api/submission/increment";
export const GET_VERSIONS = "/api/submission/versions";
export const DELETE_SUBMISSION = "/api/submission/delete";

export const SUPPORTING_DOCUMENT = "/api/submission/supporting/document";
export const SUPPORTING_DOCUMENT_METADATA = "/api/submission/supporting/document/metadata";
export const DELETE_SUPPORTING_DOCUMENT_ENDPOINT = "/api/submission/supporting/document/delete";

export const REVIEW_ENDPOINT = "/api/submission/review";
export const REVIEW_DECISION_ENDPOINT = "/api/submission/review/decision";

export const COMMENT_ENDPOINT = "/api/submission/review/comment";
export const COMMENT_FILE_ENDPOINT = "/api/submission/review/comment/file";

export const FEATURED_SUBMISSIONS_ENDPOINT = "/api/submission/published/featured";
export const SUBMISSION_OF_THE_DAY_ENDPOINT = "/api/submission/published/submission_of_the_day";
export const PUBLISHED_SUBMISSIONS_ENDPOINT = "/api/submission/published";
export const MY_PUBLICATIONS_ENDPOINT = "/api/submission/published/my_publications";
export const GET_PUBLICATION_ENDPOINT = "/api/submission/published/:publicationId";