import {Container, Image, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {loginPath, registerPath, themePath, userPath} from "@config/paths";
import {useHistory} from "react-router-dom";
import {UserService} from "@services/user/userService";
import { AuthenticatedNavigationDropdown, UnauthenticatedNavigationDropdown } from "@components/navbar/NavigationDropdown";
import {useDispatch, useSelector} from "react-redux";
import {selectUser, setUser} from "@slices/userSlice";
import {defaultProfileLink, userProfilePictureEndpoint} from "@root/config";
import NotificationDropdown from "@components/notification/NotificationDropdown";
import AnnouncementDropdown from "@components/announcement/AnnouncementDropdown";
import {v4} from "uuid";
import { AuthenticatedStatus, selectAuthenticatedStatus } from "@slices/authenticatedSlice";

/**
 * Represents the top navigation bar within the system
 */
export default function TopNavbar() {
    const authenticated = useSelector(selectAuthenticatedStatus);

    return authenticated === AuthenticatedStatus.AUTHENTICATED
        ? <AuthenticatedNavbar />
        : <UnauthenticatedNavbar />
}

function AuthenticatedNavbar() {
    const history = useHistory();
    const dispatch = useDispatch();
    const userService = new UserService();
    const user = useSelector(selectUser);

    function logout() {
        dispatch(setUser(undefined));
        userService.logout().then(() => {
            history.push(loginPath);
        });
    }

    if (!user)
        return null;

    return (
        <Navbar bg="primary" variant="dark" sticky="top" className="mb-2 py-0">
            <Container>
                <Navbar.Brand className="ml-2">Team 15</Navbar.Brand>
                <AuthenticatedNavigationDropdown />
                <Nav navbarScroll>
                    <AnnouncementDropdown />
                    <NotificationDropdown />
                </Nav>
                <Nav>
                    <NavDropdown title={<Image roundedCircle height={30} width={30}
                                               src={`${userProfilePictureEndpoint}?random=${v4()}}`}
                                               onError={e => (e.target as HTMLImageElement).src = defaultProfileLink} />}>
                        <NavDropdown.Item onClick={() => history.push(`${userPath}/${user.id}`)}>Profile</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push(themePath)}>Themes</NavDropdown.Item>
                        <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>);
}

function UnauthenticatedNavbar() {
    const history = useHistory();

    return (
        <Navbar bg="primary" variant="dark" sticky="top" className="mb-2 py-0">
            <Container>
                <Navbar.Brand className="ml-2">Team 15</Navbar.Brand>
                <UnauthenticatedNavigationDropdown />

                <Nav>
                    <NavDropdown title={
                        <Image
                            roundedCircle
                            height={30}
                            width={30}
                            src={`${userProfilePictureEndpoint}?random=${v4()}}`}
                            onError={e => (e.target as HTMLImageElement).src = defaultProfileLink}
                        />}
                    >
                        <NavDropdown.Item onClick={() => history.push(loginPath)}>Sign In</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => history.push(registerPath)}>Register</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
}

