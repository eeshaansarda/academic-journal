import {User} from "@responses/user";
import axios, {AxiosResponse} from "axios";
import {
    addRoleEndpoint,
    changePasswordEndpoint,
    changeProfileFieldsEndpoint,
    changeProfileFieldVisibilityEndpoint,
    changeProfilePictureEndpoint,
    completeForgottenPasswordEndpoint,
    initiateForgottenPasswordEndpoint,
    loginEndpoint, logoutEndpoint,
    publicUserProfileEndpoint,
    registerEndpoint, userDetailsEndpoint,
    usersEndpoint,
    verifyEmailEndpoint
} from "@root/config";
import {IGetUsers} from "@responses/user";
import NodeRSA from "node-rsa";
import {UserRole} from "@role/role";

export interface IUserService {
    login(email: string, password: string, encryptionKey: NodeRSA): Promise<AxiosResponse>;
    register(user: User, encryptionKey: NodeRSA): Promise<AxiosResponse>;
    getUsers(username: string | undefined, pageNumber: number, sort: number): Promise<AxiosResponse>;
    changePassword(currentPassword: string, newPassword: string, encryptionKey: NodeRSA): Promise<AxiosResponse>;
    changeProfilePicture(formData: FormData): Promise<AxiosResponse>;
    changeProfileFields(data: {[key: string]: string}): Promise<AxiosResponse>;
    changeProfileFieldVisibility(field: string, visible: boolean): Promise<AxiosResponse>;
    getDetails(): Promise<AxiosResponse>;
    getPublicProfile(userId: string): Promise<AxiosResponse>;
    logout(): Promise<AxiosResponse>;
    initiateForgottenPassword(email: string): Promise<AxiosResponse>;
    completeForgottenPassword(id: string, newPassword: string, token: string, encryptionKey: NodeRSA): Promise<AxiosResponse>;
    verifyEmail(id: string, token: string): Promise<AxiosResponse>;
    getInstitutions(searchTerm: string): Promise<AxiosResponse>;
    setRole(userId: string, role: UserRole): Promise<AxiosResponse>;
}

export class UserService implements IUserService {
    login(email: string, password: string, encryptionKey: NodeRSA) {
        const plainText = JSON.stringify({ email, password });
        const data = encryptionKey.encrypt(plainText).toString('hex');

        return axios.post(loginEndpoint, {
            data
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
    }

    register(user: User, encryptionKey: NodeRSA): Promise<AxiosResponse> {
        const plainText = JSON.stringify(user);
        const data = encryptionKey.encrypt(plainText).toString('hex');

        return axios.post(registerEndpoint, {
            data
        }, {
        headers: {
           'Content-Type': 'application/json'
        },
        withCredentials: true
       })
    }

    getUsers(username: string | undefined, pageNumber: number, sort: number) {
        return axios.get<IGetUsers>(usersEndpoint, {
            params: {
                username,
                pageNumber,
                sort
            },
            withCredentials: true
        });
    }

    changePassword(currentPassword: string, newPassword: string, encryptionKey: NodeRSA) {
        const plainText = JSON.stringify({ currentPassword, newPassword });
        const data = encryptionKey.encrypt(plainText).toString('hex');
        
        return axios.post(changePasswordEndpoint,{
            data
        });
    }

    changeProfilePicture(formData: FormData): Promise<AxiosResponse> {
        return axios.post(changeProfilePictureEndpoint, formData, {
            withCredentials: true
        });
    }

    changeProfileFields(data: {[key: string]: string}): Promise<AxiosResponse> {
        return axios.post(changeProfileFieldsEndpoint, data, {
            withCredentials: true
        });
    }

    changeProfileFieldVisibility(field: string, visible: boolean): Promise<AxiosResponse> {
        return axios.post(changeProfileFieldVisibilityEndpoint, {
            field,
            visible
        }, {
            withCredentials: true
        });
    }

    getDetails(): Promise<AxiosResponse> {
        return axios.get(userDetailsEndpoint, {
            withCredentials: true
        });
    }

    getPublicProfile(userId: string): Promise<AxiosResponse> {
        return axios.get(`${publicUserProfileEndpoint}/${userId}`, {
            withCredentials: true
        });
    }

    logout(): Promise<AxiosResponse> {
        return axios.post(logoutEndpoint, null, {
            withCredentials: true
        });
    }

    initiateForgottenPassword(email: string): Promise<AxiosResponse> {
        return axios.post(initiateForgottenPasswordEndpoint, {
            email
        });
    }

    completeForgottenPassword(id: string, newPassword: string, token: string, encryptionKey: NodeRSA): Promise<AxiosResponse> {
        const plainText = JSON.stringify({ id, newPassword, token });
        const data = encryptionKey.encrypt(plainText).toString('hex');

        return axios.post(completeForgottenPasswordEndpoint, {
            data
        });
    }

    verifyEmail(id: string, token: string): Promise<AxiosResponse> {
        return axios.post(verifyEmailEndpoint, {
            id, token
        });
    }

    getInstitutions(searchTerm: string): Promise<AxiosResponse> {
        return axios.get(`http://universities.hipolabs.com/search?name=${encodeURIComponent(searchTerm)}&country=United+Kingdom`);
    }

    setRole(userId: string, role: UserRole): Promise<AxiosResponse> {
        return axios.put(addRoleEndpoint, {
            userId,
            role
        });
    }
}
