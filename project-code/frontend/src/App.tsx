import Login from "@pages/login/Login";
import Register from "@pages/register/Register";
import ConfirmSso from '@pages/sso/ConfirmSso';
import { createBrowserHistory } from "history";
import {AuthProvider, NotAuthenticatedPage, OpenPage} from "@auth/Authentication";
import {Router, Switch} from "react-router-dom";
import * as paths from "@config/paths";
import { CodeReview } from "@pages/codeReview/CodeReview";
import {Provider} from "react-redux";
import {store} from '@store/store';
import ErrorHandler from "@root/error/ErrorHandler";
import {axiosInstance, setUpAxiosInstance} from "@services/axiosInstance";
import SelectSso from "@pages/sso/SelectSso";
import FeaturedSubmissions from "@pages/published/FeaturedSubmissions";
import {publicationPath, publicationsPath, featuredPath} from "@config/paths";
import PublishedSubmissions from "@pages/published/PublishedSubmissions";
import PublishedSubmission from "@pages/published/PublishedSubmission";
import InitiateForgottenPassword from '@pages/password/InitiateForgottenPassword';
import CompleteForgottenPassword from '@pages/password/CompleteForgottenPassword';
import VerifyEmail from "@pages/email/VerifyEmail";
import React from "react";
import ScrollToTop from "@components/scrollToTop/ScrollToTop";
import ThemeProvider from "@components/theme/ThemeProvider";
import { SocketProvider } from "@config/SocketContext";

setUpAxiosInstance(axiosInstance, store);

function App() {
    const history = createBrowserHistory();

    return (
        <Provider store={store}>
            <ThemeProvider>
                <AuthProvider>
                    <SocketProvider>
                        <Router history={history}>
                            <ScrollToTop />
                            <Switch>
                                {/** Login/register related pages only accessible to users not signed in */}
                                <NotAuthenticatedPage navbar path={paths.loginPath}>
                                    <Login />
                                </NotAuthenticatedPage>
                                <NotAuthenticatedPage navbar path={paths.registerPath}>
                                    <Register />
                                </NotAuthenticatedPage>
                                <NotAuthenticatedPage navbar path={paths.initiateForgottenPasswordPath}>
                                    <InitiateForgottenPassword />
                                </NotAuthenticatedPage>
                                <NotAuthenticatedPage navbar path={paths.completeForgottenPasswordPath}>
                                    <CompleteForgottenPassword />
                                </NotAuthenticatedPage>
                                <NotAuthenticatedPage navbar path={paths.selectSsoPath}>
                                    <SelectSso />
                                </NotAuthenticatedPage>

                                {/** Miscellaneous pages accessible to everyone */}
                                <OpenPage navbar path={paths.verifyEmailPath}>
                                    <VerifyEmail />
                                </OpenPage>
                                <OpenPage path={paths.confirmSsoPath}>
                                    <ConfirmSso />
                                </OpenPage>

                                {/** Submission related pages accessible to all users */}
                                <OpenPage navbar path={featuredPath}>
                                    <FeaturedSubmissions />
                                </OpenPage>
                                <OpenPage navbar path={publicationsPath}>
                                    <PublishedSubmissions />
                                </OpenPage>
                                <OpenPage navbar path={`${publicationPath}/:publicationId`}>
                                    <PublishedSubmission />
                                </OpenPage>

                                <CodeReview />
                            </Switch>
                        </Router>
                    </SocketProvider>
                </AuthProvider>
            </ThemeProvider>

            <ErrorHandler />
            <br /><br /><br /><br /><br />
            <br /><br /><br /><br /><br />

        </Provider>
    );
}

export default App;
