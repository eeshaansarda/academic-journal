import React, {SyntheticEvent, useState} from "react";
import {useHistory} from "react-router-dom";
import {Col, Nav, NavDropdown, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import "@components/navbar/navbar.css";
import {
    AdminIcon,
    DashboardIcon, PrivateDiscussionIcon,
    AnnouncementIcon,
    SubmissionIcon,
    UserIcon,
    PublishedIcon,
    FeaturedIcon
} from "@components/icon/Icons";
import * as paths from "@config/paths";
import {RoleRestricted} from "@components/roleRestricted/RoleRestricted";
import {UserRole} from "@role/role";

/**
 * This React Script contains the component for the Navigation dropdown that
 * appears in the top navigation bar.
 */

enum ExtendedLinkType {
    SUBMISSIONS
}

/**
 * @property onClick event that is fired when we click the dropdown
 * @property onHover event that is fired when we hover over a component
 * @property title title of the dropdown
 * @property paneKey the key that represents the extended dropdown
 */
interface DropdownExtendedLinkProps {
    onClick?: (key: ExtendedLinkType) => void;
    onHover?: (key: ExtendedLinkType) => void;
    icon: React.ReactNode;
    title: string;
    paneKey: ExtendedLinkType;
}

/**
 * @property title the title of the dropdown link
 * @property icon the icon to display in the dropdown
 * @property path the path to transition to when clicking the dropdown
 */
interface DropdownLinkProps {
    title: string;
    icon: React.ReactNode;
    path: string;
    onHover?: () => void;
}

/**
 * Represents an extended link. This is a component that upon hover displays a right hand pane with more options
 * @param props the arguments injected into the component
 */
function DropdownExtendedLink(props: DropdownExtendedLinkProps) {
    function onClick(e: SyntheticEvent) {
        if (props.onClick)
            props.onClick(props.paneKey);
    }

    function onHover(e: SyntheticEvent) {
        if (props.onHover)
            props.onHover(props.paneKey);
    }

    return (
        <NavDropdown.Item onClick={onClick} onMouseEnter={onHover}>
            <Row>
                <Col xs={1}>{props.icon}</Col>
                <Col xs="auto">{props.title}</Col>
            </Row>
        </NavDropdown.Item>
    )
}

function DropdownLink(props: DropdownLinkProps) {
    const history = useHistory();

    return (
        <NavDropdown.Item
            onClick={() => history.push(props.path)}
            onMouseEnter={props.onHover || (() => {})}
        >
            <Row>
                <Col xs={1}>{props.icon}</Col>
                <Col xs="auto">{props.title}</Col>
            </Row>
        </NavDropdown.Item>
    );
}

export function AuthenticatedNavigationDropdown() {
        const history = useHistory();
        const [rightPaneKey, setRightPaneKey] = useState<ExtendedLinkType | null>(null);

        function getRightPane() {
            switch (rightPaneKey) {
                case ExtendedLinkType.SUBMISSIONS:
                    return <SubmissionRightPanel/>;
                default:
                    return <div/>
            }
        }

        function SubmissionRightPanel() {
            return (<>
                <NavDropdown.Item onClick={() => history.push(paths.submissionsPath)}>View
                    Submissions</NavDropdown.Item>
                <NavDropdown.Item onClick={() => history.push(paths.newSubmissionPath)}>Create
                    Submission</NavDropdown.Item>
            </>);
        }


        return (
            <Nav className="me-auto">
                <NavDropdown title={<FontAwesomeIcon icon={faBars}/>}>
                    <div className="navigation-dropdown">
                        <Row>
                            <Col>
                                <DropdownLink
                                    title="Dashboard"
                                    icon={<DashboardIcon/>}
                                    path={paths.dashboardPath}
                                    onHover={() => setRightPaneKey(null)}
                                />

                                <DropdownExtendedLink paneKey={ExtendedLinkType.SUBMISSIONS}
                                                      icon={<SubmissionIcon/>}
                                                      title="Submissions"
                                                      onClick={() => history.push(paths.submissionsPath)}
                                                      onHover={setRightPaneKey}/>
                                <DropdownLink
                                    title="Featured"
                                    icon={<FeaturedIcon/>}
                                    path={paths.featuredPath}
                                    onHover={() => setRightPaneKey(null)}
                                />

                                <DropdownLink
                                    title="All Publications"
                                    icon={<PublishedIcon/>}
                                    path={paths.publicationsPath}
                                    onHover={() => setRightPaneKey(null)}
                                />

                                <DropdownLink
                                    title="Private Discussions"
                                    icon={<PrivateDiscussionIcon/>}
                                    path={paths.privateDiscussionsPath}
                                    onHover={() => setRightPaneKey(null)}
                                />

                                <DropdownLink
                                    title="Users"
                                    icon={<UserIcon/>}
                                    path={paths.usersPath}
                                    onHover={() => setRightPaneKey(null)}
                                />

                                <RoleRestricted roleRequired={UserRole.ADMIN}>
                                    <DropdownLink
                                        title="Admin"
                                        icon={<AdminIcon/>}
                                        path={paths.adminPath}
                                        onHover={() => setRightPaneKey(null)}
                                    />
                                </RoleRestricted>
                                <RoleRestricted roleRequired={UserRole.ADMIN}>
                                    <DropdownLink
                                        title="Announcements"
                                        icon={<AnnouncementIcon/>}
                                        path={paths.createAnnouncementPath}
                                        onHover={() => setRightPaneKey(null)}
                                    />
                                </RoleRestricted>
                            </Col>
                            <Col>
                                {getRightPane()}
                            </Col>
                        </Row>
                    </div>
                </NavDropdown>
            </Nav>
        );
}


export function UnauthenticatedNavigationDropdown() {
    return (
        <Nav className="me-auto">
            <NavDropdown title={<FontAwesomeIcon icon={faBars}/>}>
                <div className="navigation-dropdown">
                    <Row>
                        <Col>
                            <DropdownLink
                                title="Featured Publications"
                                icon={<FeaturedIcon/>}
                                path={paths.featuredPath}
                            />
                            <DropdownLink
                                title="All Publications"
                                icon={<PublishedIcon/>}
                                path={paths.publicationsPath}
                            />
                        </Col>
                    </Row>
                </div>
            </NavDropdown>
        </Nav>
    );
}
