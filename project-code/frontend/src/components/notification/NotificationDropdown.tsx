import {Col, NavDropdown, Row} from "react-bootstrap";
import {BlueInfoIcon, BluePublishedIcon, BlueReviewIcon, BlueSubmissionIcon, InfoIcon, LinkIcon, NotificationIcon, PublishedIcon, ReviewIcon, SubmissionIcon} from "@components/icon/Icons";
import NotificationService from "@services/notification/notificationService";
import {useContext, useEffect} from "react";
import {Notification, NotificationType} from "@responses/notification";
import { SocketContext } from "@config/SocketContext";
import Dropdown from "@components/dropdown/Dropdown";
import useStateRef from "react-usestateref";

/**
 * @property notification the notification to display
 * @property onClick event that is fired when we click on the notification
 */
interface NotificationLinkProps {
    notification: Notification;
    onClick: (notificationId: number) => void;
}

/**
 * Component that represents a notification to be clicked on.
 * The link represents a notification that when clicked on sets the notification as seen.
 *
 * @param props the properties to inject into the component
 * @constructor
 */
function NotificationLink(props: NotificationLinkProps) {
    const renderIcon = () => {
        switch (props.notification.type) {
            case NotificationType.PUBLICATION:
                return props.notification.seen ? <PublishedIcon /> : <BluePublishedIcon />;
            case NotificationType.SUBMISSION:
                return props.notification.seen ? <SubmissionIcon /> : <BlueSubmissionIcon />;
            case NotificationType.REVIEW:
                return props.notification.seen ? <ReviewIcon /> : <BlueReviewIcon />;
            case NotificationType.MISC:
                return props.notification.seen ? <InfoIcon /> : <BlueInfoIcon />;
        }
    }

    return (
        <>
            <Row 
                onClick={() => props.onClick(props.notification.notificationId)}>
                <Row>
                    <Col className="me-1" xs={1}>{renderIcon()}</Col>
                    
                    {props.notification.url 
                        ? <Col xs={1} onClick={() => document.location.href = props.notification.url as string}><LinkIcon /></Col>
                        : <Col/>
                    }
                </Row>

                <Row>
                    <span>{props.notification.message}</span>
                </Row>
            </Row>
        </>
    )
}

/**
 * Component that displays notifications in a dropdown component
 */
export default function NotificationDropdown() {
    const notificationService = new NotificationService();
    const [notifications, setNotifications, notificationsRef] = useStateRef<Notification[]>([]);
    const socket = useContext(SocketContext);

    /**
     * Sets the notification as seen clicked on
     * @param notificationId the notification to mark as seen
     */
    function setSeen(notificationId: number) {
        notificationService.setSeen(notificationId).then(res => {
            if (res.data && res.data.status === "success")
                getNotifications();
        });
    }

    /**
     * Gets the notifications in the system
     */
    function getNotifications() {
        notificationService.getNotifications().then(res => {
            if (res.data && res.data.status === "success")
                setNotifications(res.data.notifications);
        });
    }

    useEffect(() => {
        /*
         * When a newNotification event is received set the list of
         * notifications
         */
        socket.on('newNotification', notification => {
            setNotifications([notification, ...notificationsRef.current])
        });

        // onMouse get the list of notifications
        getNotifications();
    }, []);

    const noNotifications = <div className="text-center">
                    <span style={{fontSize: "2rem"}}>
                        <NotificationIcon />
                    </span>
            <p>You have no notifications!</p>
        </div>;

    return (
        <Dropdown 
            icon={<NotificationIcon />}
            numNewElements={notifications.filter(notification => !notification.seen).length}
            noElementsComponent={noNotifications}
            shouldStayOpen={true}
        >

            {notifications.map(notification => <NavDropdown.Item
                                                    key={notification.notificationId}
                                                    className="text-wrap" 
                                                    style={{width: '180px'}}>
                                                    <NotificationLink onClick={setSeen} notification={notification} />
                                                </NavDropdown.Item>
            )}
        </Dropdown>
    );
}