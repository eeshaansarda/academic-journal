import {Redirect, Route, Switch} from "react-router-dom";
import {AuthenticatedPage, AuthProvider} from "@auth/Authentication";
import * as paths from "@config/paths";
import Profile from "@pages/users/profile/Profile";
import SubmissionList from "@pages/submission/SubmissionList";
import ViewSubmission from "@pages/submission/view/ViewSubmission";
import {Dashboard} from "@pages/dashboard/Dashboard";
import NewSubmission from "@pages/submission/NewSubmission";
import ChangePassword from "@pages/password/ChangePassword";
import UserList from "@pages/users/UserList";
import Admin from "@pages/admin/Admin";
import {UserRole} from "@role/role";
import SubmissionVersions from "@pages/submission/versions/SubmissionVersions";
import UserProfile from '@pages/users/UserProfile';
import NotFound404 from "@pages/404/404NotFound";
import ViewAnnouncement from "@pages/announcement/view/ViewAnnouncement";
import CreateAnnouncement from "@pages/announcement/create/CreateAnnouncement";
import PrivateDiscussion from "@pages/privateDiscussion/PrivateDiscussion";
import PrivateDiscussions from "@pages/privateDiscussion/PrivateDiscussions";
import ViewSupportingDocuments from "@pages/submission/supportingDocuments/ViewSupportingDocuments";
import Theme from "@pages/theme/Theme";
import {DefaultTheme} from "@components/theme/ThemeProvider";

/**
 * Contains the set of pages that are accessible when the user has logged in
 * @constructor
 */
export function CodeReview() {
    return (
        <AuthProvider>
            <DefaultTheme />
            <Switch>
                <AuthenticatedPage navbar path={paths.dashboardPath}>
                    <Dashboard />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.profilePath}>
                    <Profile />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.changePasswordPath}>
                    <ChangePassword />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.usersPath}>
                    <UserList />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.submissionsPath}>
                    <SubmissionList />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.usersPath}>
                    <UserList />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={`${paths.userPath}/:userId`}>
                    <UserProfile />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.newSubmissionPath}>
                    <NewSubmission />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.adminPath} roleRequired={UserRole.ADMIN}>
                    <Admin />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.versionsPath}>
                    <SubmissionVersions />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.supportingDocumentsPath}>
                    <ViewSupportingDocuments />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={`${paths.submissionPath}/:submission`}>
                    <ViewSubmission />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.resourceNotFound}>
                    <NotFound404 />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.announcementPath}>
                    <ViewAnnouncement />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.createAnnouncementPath}>
                    <CreateAnnouncement />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.privateDiscussionPath}>
                    <PrivateDiscussion />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.privateDiscussionsPath}>
                    <PrivateDiscussions />
                </AuthenticatedPage>

                <AuthenticatedPage navbar path={paths.themePath}>
                    <Theme />
                </AuthenticatedPage>

                <Route exact path="/">
                    <Redirect to={paths.dashboardPath} />
                </Route>
            </Switch>
        </AuthProvider>
    );
}
