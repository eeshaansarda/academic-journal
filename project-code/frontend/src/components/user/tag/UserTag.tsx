import {Link} from "react-router-dom";
import {userPath} from "@config/paths";

interface UserTagProps {
    userId: string;
    username: string;
}

/**
 * Represents a user tag. When clicked takes an individual to the user's page
 *
 * @param userId
 * @param username
 * @constructor
 */
export default function UserTag({ userId, username }: UserTagProps) {
    return (<span className="me-1">
        <Link to={`${userPath}/${userId}`}>@{username}</Link>
    </span>);
}