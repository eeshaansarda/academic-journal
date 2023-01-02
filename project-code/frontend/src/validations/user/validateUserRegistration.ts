const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function getEmailValidation(email: string): string | undefined {
    if (!email) {
        return 'Email is required';
    } else if (!email.match(EMAIL_REGEX)) {
        return 'Invalid email';
    }
    return undefined;
}

/**
 * Checks if a password is valid.
 * @param password The password.
 * @returns Whether the password is valid.
 */
function isValidPassword(password: string): boolean {
    return password.length >= 8 && password !== password.toLowerCase()
        && password !== password.toUpperCase() && !!password.match(/\d/);
}

export function getPasswordValidation(password: string): string | undefined {
    if (!password) {
        return 'Password is required';
    } else if (!isValidPassword(password)) {
        return 'Password must be at least 8 characters long, and contain at least one of each of the following: lowercase letter, uppercase letter, number';
    }
    return undefined;
}

export function getUsernameValidation(username: string): string | undefined {
    if (!username) {
        return 'Username is required';
    } else if (username.length < 4) {
        return 'Username must be at least 4 characters';
    } else if (username.indexOf(" ") !== -1) {
        return 'Your username cannot contain spaces';
    }
    return undefined;
}

export function getFirstNameValidation(firstName: string): string | undefined {
    if (!firstName) {
        return 'First name is required';
    }
    return undefined;
}

export function getLastNameValidation(lastName: string): string | undefined {
    if (!lastName) {
        return 'Last name is required';
    }
    return undefined;
}