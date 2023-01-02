import {UserRole} from "@role/role";
import React from "react";
import {Badge} from "react-bootstrap";

interface UserRolesPillProps {
    role: UserRole;
}

const hasRole = (role: UserRole, userRole: number) => (role & userRole) === role;

/**
 * Bootstrap pill to display the users role
 *
 * @param role
 * @constructor
 */
export default function UsersRolePill({ role }: UserRolesPillProps) {
    const roles: JSX.Element[] = [];

    if (hasRole(UserRole.ADMIN, role))
        roles.push(<Badge pill key={UserRole.ADMIN} bg="warning">Admin</Badge>)

    if (hasRole(UserRole.EDITOR, role))
        roles.push(<Badge pill key={UserRole.EDITOR} bg="danger">Editor</Badge>);

    return <>{roles}</>;
}