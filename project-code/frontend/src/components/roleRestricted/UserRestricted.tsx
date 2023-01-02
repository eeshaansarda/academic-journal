import {useSelector} from "react-redux";
import {selectUser} from "@slices/userSlice";
import React from "react";

/**
 * @property userId the id of the user we are restricting access to
 * @property children the child components to display should the user meet the desired role
 */
export interface UserRestrictedProps {
    userId: string;
    children: React.ReactNode | React.ReactNode[];
}

/**
 * Component for restricting access to content based on the given user
 * @param props
     */
export default function UserRestricted(props: UserRestrictedProps) {
    const user = useSelector(selectUser);

    if (!user || user.id !== props.userId)
        return null;

    return <>{props.children}</>;
}