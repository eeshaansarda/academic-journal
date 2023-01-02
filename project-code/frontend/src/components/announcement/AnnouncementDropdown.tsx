import {AnnouncementIcon} from "@components/icon/Icons";
import {useContext, useEffect, useState} from "react";
import {Announcement} from "@responses/announcement";
import {AnnouncementService} from "@services/announcement/announcementService";
import {Col, Row} from "react-bootstrap";
import {truncate, uniq} from "lodash";
import {removeTags} from "@root/utilities/sanitize/sanitizeHtml";
import {NavDropdown} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {announcementPath} from "@config/paths";
import { SocketContext } from "@config/SocketContext";
import Dropdown from "@components/dropdown/Dropdown";
import useStateRef from "react-usestateref";

/**
 * This react script contains a component for the announcement dropdown
 * in the top navbar.
 */


/**
 * The props for each individual link item. This is consists of each distinct link in the dropdown
 * that upon clicking takes the user to the given announcement
 */
interface AnnouncementLinkProps {
    announcement: Announcement;
    seen: boolean;
    onClick: (announcementId: string) => void;
}

/**
 * Component for each individual link in an announcement
 *
 * @param announcement an announcement response to display
 * @param onClick the event that is fired when the user clicks on the link
 * @param seen whether or not the announcement has been seen before.
 */
function AnnouncementLinks({ announcement, onClick, seen }: AnnouncementLinkProps) {
    const history = useHistory();
    const navigationLink = announcementPath.replace(':announcementId', announcement.id);

    return (
        <NavDropdown.Item onClick={() => history.push(navigationLink)}>
            <Row onClick={() => onClick(announcement.id)}>
                <Col>
                    <span style={{fontSize: "2rem", color: "blue"}}>{!seen ? '·'  : null}</span>
                    <span style={{fontWeight: "bold"}}>{announcement.title}</span>
                    <br />
                    <span>{truncate(removeTags(announcement.content))}</span>
                </Col>
            </Row>
        </NavDropdown.Item>
    );
}

/**
 * The actual announcement dropdown component. Consists of a set of links
 * that when clicked takes the user to the announcement page.
 */
export default function AnnouncementDropdown() {
    const [announcements, setAnnouncements, announcementsRef] = useStateRef<Announcement[]>([]);
    const [seen, setSeen] = useState<string[]>([]);
    const socket = useContext(SocketContext);

    const announcementService = new AnnouncementService();

    /**
     * Get the announcements and sort them by the date they were published in
     * descending order.
     */
    function getAnnouncements() {
        announcementService.getAnnouncements().then(res => {
            if (res.data && res.data.status === "success")
                setAnnouncements(res.data.announcements.sort((d1: Announcement, d2: Announcement) => d2.published - d1.published));
        })
    }

    /**
     * Every time there is a newAnnouncement event in the socket update the announcements.
     * Initially get all the announcements and get seen announcements in local storage.
     * We only store whether or not an announcement has been seen in local storage as it doesn't seem
     * necessary to store this for all users.
     */
    useEffect(() => {
        socket.on('newAnnouncement', announcement => {
            setAnnouncements([announcement, ...announcementsRef.current]);
        });

        getAnnouncements();
        getSeenAnnouncements();
    }, []);

    /**
     * Get the initial seen announcements from local storage. This means if a user has seen an
     * announcement it is cached locally
     */
    function getSeenAnnouncements() {
        const items: string[] = JSON.parse(localStorage.getItem('announcements') ?? '[]');
        setSeen(items);
    }


    /**
     * Mark an announcement as read and update local storage. Update the list of seen
     * announcements
     *
     * @param announcementId the announcement we are marking as read.
     */
    function markRead(announcementId: string) {
        const items = uniq([...seen, announcementId]);
        localStorage.setItem('announcements', JSON.stringify(items));
        setSeen(items);
    }

    /**
     * Render component for when there are no announcements.
     */
    const noElementsComponent = <div data-testid="no-announcements" className="text-center">
                    <span style={{fontSize: "2rem"}}>
                        <AnnouncementIcon />
                    </span>
        <p>There are no announcements!</p>
    </div>

    return (
        <Dropdown 
            icon={<AnnouncementIcon />}
            numNewElements={announcements.filter(announcement => seen.indexOf(announcement.id) === -1).length}
            noElementsComponent={noElementsComponent}>

            {announcements.map(announcement =>
                <AnnouncementLinks 
                    key={announcement.id} 
                    seen={seen.indexOf(announcement.id) !== -1}
                    onClick={markRead} 
                    announcement={announcement} />)}
        </Dropdown>
    );
}