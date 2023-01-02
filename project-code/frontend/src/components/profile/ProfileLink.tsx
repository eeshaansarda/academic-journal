import {Image} from "react-bootstrap";
import {defaultProfileLink, userProfilePictureEndpoint} from "@root/config";
import UserTag from "@components/user/tag/UserTag";

interface ProfileLinkProps {
    username?: string;
    userId: string;
    height?: number;
    width?: number;
}

/**
 *
 * @param height the height of the image in the profile
 * @param width the width of the image in the profile
 * @param username the username of the user we are getting the profile of
 * @param userId the id of the user that we are getting the profile of
 */
export default function ProfileLink({ height = 40, width = 40, username, userId }: ProfileLinkProps) {
    return (
        <div>
            <Image roundedCircle
                   height={height}
                   width={width}
                   src={`${userProfilePictureEndpoint}?userId=${userId}`}
                   onError={e => (e.target as HTMLImageElement).src = defaultProfileLink} /><br />
            { username ? <UserTag userId={userId} username={username} /> : null }
        </div>
    );
}