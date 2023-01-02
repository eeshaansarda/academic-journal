import React from "react";
import {useSelector} from "react-redux";
import {selectUser} from "@slices/userSlice";
import {UserRole} from "@role/role";

/**
 * @property roleRequired the role we are restricting access to
 * @property children the child components to render
 */
interface RoleRestrictedProps {
    roleRequired: UserRole;
    children: React.ReactNode;
}

/**
 * Component for restricting access to only users of the given role
 *
 * @param props
 */
export function RoleRestricted(props: RoleRestrictedProps) {
    const user = useSelector(selectUser);

    let role : UserRole | null = null
    if (user) role = user.role & props.roleRequired;

    if (role !== props.roleRequired)
        return null;

    return (
        <>
            {props.children}
        </>);
}