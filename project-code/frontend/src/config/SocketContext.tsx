import { socketIoEndpoint } from "@root/config";
import { UserService } from "@services/user/userService";
import { selectUser, setUser } from "@slices/userSlice";
import React, { createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { loginPath } from "./paths";

export type ISocketContext = Socket;

export const SocketContext = createContext({} as ISocketContext);

/**
 * The socket context provider element. Allows all components within it to
 * access the socket instance.
 * @param children The children elements.
 * @returns The socket context provider element.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
    const history = useHistory();
    const dispatch = useDispatch();
    const userService = new UserService();
    const user = useSelector(selectUser);

    if (!user) {
        return (
            <div>
                { children }
            </div>
        );
    }

    const socketUrl = '[SOCKET_URL]';
    const socket = io(socketUrl);

    if (socket.connected) {
        socket.emit('join', {
            id: user.id
        });
    } else {
        socket.on('connect', () => {
            socket.emit('join', {
                id: user.id
            });
        });
    }

    // log the user out when their session is updated (e.g. password changed, banned etc)
    socket.on('logout', () => {
        dispatch(setUser(undefined));
        userService.logout().then(() => {
            history.push(loginPath);
        });
    });

    return (
        <SocketContext.Provider value={socket}>
            { children }
        </SocketContext.Provider>
    );
}
