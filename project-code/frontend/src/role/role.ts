export enum UserRole {
    USER = 0,
    ADMIN = 1,
    EDITOR = 2
}

export function userHasRole(role: UserRole, usersRole: number) {
    return (role & usersRole) === role;
}