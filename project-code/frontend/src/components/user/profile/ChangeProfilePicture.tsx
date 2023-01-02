import {Form, Image} from "react-bootstrap";
import {defaultProfileLink, userProfilePictureEndpoint} from "@root/config";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {UserService} from "@services/user/userService";

interface ChangeProfilePictureProps {
    userId: string;
    disabled?: boolean;
}

/**
 * Changes the profile picture of a user
 *
 * @param userId
 * @param disabled
 * @constructor
 */
export default function ChangeProfilePicture ({ userId, disabled = false }: ChangeProfilePictureProps) {
    const [ isProfileHovered, setProfileHovered ] = useState(false);
    const userService = new UserService();


    /**
     * Attempts to change the user's profile picture.
     */
    function changeProfilePicture() {
        const form = document.getElementById('profilePictureForm') as HTMLFormElement;
        const formData = new FormData(form);

        userService.changeProfilePicture(formData).then(response => {
            if (response.data.status && response.data.status === 'success') {
                // force profile picture to refresh
                const image = document.getElementById('profilePicture') as HTMLImageElement;
                image.src = `${userProfilePictureEndpoint}?t=${Date.now()}`;
            }
        }).catch(_ => {});
    }

    return (
        <div className="profile-picture-container">
            <Image
                id="profilePicture"
                className="border border-dark"
                height={150}
                width={150}
                src={`${userProfilePictureEndpoint}?userId=${userId}`}
                tabIndex={-1}
                roundedCircle
                onError={e => (e.target as HTMLImageElement).src = defaultProfileLink}
                onMouseEnter={_ => setProfileHovered(true) }
                onMouseLeave ={_ => setProfileHovered(false) }
                style={{ opacity: isProfileHovered ? 0.8 : 1 }}
                onClick={() => document.getElementById('profilePictureInput')?.click() }
            />

            <FontAwesomeIcon
                className="profile-picture-overlay"
                icon={faPen}
                style={{ display: isProfileHovered && !disabled ? 'block' : 'none' }}
                onMouseEnter={e => setProfileHovered(true) }
                onMouseLeave ={e => setProfileHovered(false) }
                onClick={() => document.getElementById('profilePictureInput')?.click() }
            />

            <Form
                id="profilePictureForm">
                <Form.Control
                    type="file"
                    id="profilePictureInput"
                    name="picture"
                    disabled={disabled}
                    hidden
                    onChange={changeProfilePicture}
                />
            </Form>
        </div>
    );
}