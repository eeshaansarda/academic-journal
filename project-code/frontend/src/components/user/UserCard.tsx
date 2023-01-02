import {PublicUser} from "@responses/user";
import {Card} from "react-bootstrap";
import ProfileLink from "@components/profile/ProfileLink";
import {userPath} from "@config/paths";
import {Link} from "react-router-dom";

interface UserCardProps {
    user: PublicUser;
}

/**
 * Represents a card that summarizes the user. When clicked takes the user to
 * their profile
 *
 * @param props
 * @constructor
 */
export default function UserCard (props: UserCardProps) {
    return (
        <Card className="m-2" style={{width: '30rem'}}>
            <Card.Body>
                <ProfileLink userId={props.user.id} />
                <Link to={`${userPath}/${props.user.id}`}><h4>{props.user.username}</h4></Link>
                <span>{props.user.firstName ?? null} {props.user.lastName ?? null}</span>
            </Card.Body>
        </Card>
    );
}