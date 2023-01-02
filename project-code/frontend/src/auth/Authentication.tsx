import React, {useEffect} from "react";
import {Redirect, Route, RouteComponentProps, RouteProps} from "react-router-dom";
import {dashboardPath, featuredPath} from "@config/paths";
import {AuthenticatedStatus, selectAuthenticatedStatus, setAuthenticated} from "@slices/authenticatedSlice";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@slices/userSlice";
import {UserRole} from "@role/role";
import {UserService} from "@services/user/userService";
import TopNavbar from "@components/navbar/TopNavbar";
import { User } from "@responses/user";
import NodeRSA from "node-rsa";

/**
 * The purpose of this react script is to provide a set of components for logging a
 * user into the system, registering a user and getting their details their personal details
 * and storing it in group state through the use of a slice.
 */


/**
 * A React Context for authorization. Specifies methods to log a user in,
 * and determine if the user has been authorized.
 */
export const AuthContext = React.createContext({} as IAuthorization);

/**
 * Represents an interface that provides methods to check if the user
 * is authenticated, log the user in and register the user.
 */
interface IAuthorization {
    login(username: string, password: string, encryptionKey: NodeRSA): Promise<boolean | string>;
    register(user: User, encryptionKey: NodeRSA): Promise<boolean | string>;
    getDetails(): Promise<User | void>;
}


/**
 * A NodeJS hook for creating an AuthProvider.
 * Defines methods for logging in, registering
 * and check if a client is authenticated.
 *
 * A client is defines as authenticated if they
 * have a JWT.
 */
export function CreateAuthProvider(): IAuthorization {
    const dispatch = useDispatch();
    const userService = new UserService();

    /**
     * Loads the user details.
     * @returns The user details.
     */
    function getDetails(): Promise<User | void> {
       return new Promise(res => {
            userService.getDetails().then(response => {
               if (response.data.status && response.data.status === 'success') {
                    dispatch(setUser(response.data.details));
                    res(response.data.details);
               } else {
                   res();
               }
           }).catch(() => res());
       });
    }

    useEffect(() => {
        getDetails().then(user => {
            dispatch(setAuthenticated(!!user));
        })
    }, []);

    return {
        /**
         * Attempts to login to a user account.
         * @param email The email.
         * @param password The password.
         * @param encryptionKey The RSA encryption key.
         * @returns Whether the login attempt was successful or the error.
         */
        login(email: string, password: string, encryptionKey: NodeRSA): Promise<boolean | string>  {
            return new Promise<boolean>(res => {
               userService.login(email, password, encryptionKey).then(response => {
                    const loggedIn = response.status === 200;
                    res(loggedIn);
                    dispatch(setAuthenticated(loggedIn));
                }).catch(err => {
                    dispatch(setAuthenticated(false));
                    if (err.response.data.status && err.response.data.status === 'failure') {
                        res(err.response.data.reason);
                    } else {
                        res(false);
                    }
                });
            });
        },

        /**
         * Attempts to register for a user account.
         * @param user The user object.
         * @param encryptionKey The RSA encryption key.
         * @returns Whether the registration was successful or the error.
         */
        register(user: User, encryptionKey: NodeRSA): Promise<boolean | string> {
            return new Promise<boolean>((res, _) => {
                userService.register(user, encryptionKey).then(response => {
                    const success = response.status === 200;
                    dispatch(setAuthenticated(success));
                    res(success)
                }).catch(err => {
                    dispatch(setAuthenticated(false));
                    if (err.response.data.status && err.response.data.status == 'failure') {
                        res(err.response.data.reason);
                    } else {
                        res(false);
                    }
                });
            });
        },
        getDetails 
    };
}

/**
 * Wrapper element for a series of routes.
 * Signifies that auth should be enabled around
 * the series of routes.
 *
 * @param children the child notes that are the child of the auth
 * provider
 *
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = CreateAuthProvider();

    return (
        <AuthContext.Provider value={auth}>
            { children }
        </AuthContext.Provider>
    );
}

interface PageProps extends RouteProps {
    navbar?: boolean;
}

/**
 * Properties required for the authentication component. If a page
 * has this wrapped around it then it is only visible if the user has been
 * authorized
 */
interface AuthenticatedPageProps extends RouteProps {
    roleRequired?: UserRole;
    navbar?: boolean;
}

/**
 * Checks whether or not the user has a given role.
 *
 * @param user the user we are checking has a role
 * @param roleRequired the role we are checking if the user
 * has the role.
 */
function userHasRole(user: User, roleRequired: UserRole) {
    return (roleRequired & user.role ) === roleRequired;
}

/**
 * A component for pages that are only accessible to users who are
 * signed in.
 * @param children The child of the react nodes.
 * @param roleRequired The role required to access the page (optional).
 * @param navbar Whether the page should have a navbar.
 * @param rest The rest of the children.
 * @returns The component.
 */
export function AuthenticatedPage({ children, roleRequired, navbar, ...rest }: AuthenticatedPageProps) {
    const authenticated = useSelector(selectAuthenticatedStatus);
    const user = useSelector(selectUser);

    const renderRoute = (routerProps: RouteComponentProps<any>) => {
        switch (authenticated) {
            // If user is authenticated then return the page along with a navbar
            case AuthenticatedStatus.AUTHENTICATED:
                // If the user does not exist or they do not have the correct role return null (hide
                // (the component).
                if (!user || (roleRequired && !userHasRole(user, roleRequired)))
                    return null;

                return (
                    <div>
                        {navbar ? <TopNavbar /> : null}
                        {children}
                    </div>
                );
            // If the user is not authenticated then redirect them
            case AuthenticatedStatus.NOT_AUTHENTICATED:
                return <Redirect to={{
                        pathname: featuredPath,
                    state: { from: routerProps.location }
                }} />
            // All other cases hide the component.
            case AuthenticatedStatus.UNKNOWN:
                return null;
        }
    };

    // Pass the props to the react-router-route
    // and display the route in question.
    return (
        <Route
            { ...rest }
            render={ renderRoute }
        />
    );
}

/**
 * A component for pages that are only accessible to users who are not
 * signed in.
 * @param children The child of the react nodes.
 * @param navbar Whether the page should have a navbar.
 * @param rest The rest of the children.
 * @returns The component.
 */
export function NotAuthenticatedPage({ children, navbar, ...rest }: PageProps) {
    const authenticated = useSelector(selectAuthenticatedStatus);

    const renderRoute = (routerProps: RouteComponentProps<any>) => {
        switch (authenticated) {
            // If authenticated redirect to the dashboard
            case AuthenticatedStatus.AUTHENTICATED:
                return <Redirect to={{
                    pathname: dashboardPath,
                    state: { from: routerProps.location }
                }} />
            // If not authenticated only show the children of the node
            case AuthenticatedStatus.NOT_AUTHENTICATED:
                return (
                    <div>
                        {navbar ? <TopNavbar /> : null}
                        {children}
                    </div>
                );
            // In all other cases return an empty component.
            case AuthenticatedStatus.UNKNOWN:
                return null;
        }
    };

    // Return the react-router-dom passing in the props provided
    return (
        <Route
            { ...rest }
            render={ renderRoute }
        />
    );
}

/**
 * A component for pages that are open to both authenticated and not
 * authenticated users.
 * @param children The child of the react nodes.
 * @param navbar Whether the page should have a navbar.
 * @param rest The rest of the children.
 * @returns The component.
 */
 export function OpenPage({ children, navbar, ...rest }: PageProps) {
    const renderRoute = (routerProps: RouteComponentProps<any>) => {
        return (
            <div>
                {navbar ? <TopNavbar /> : null}
                {children}
            </div>
        );
    };

    return (
        <Route
            { ...rest }
            render={ renderRoute }
        />
    );
}
