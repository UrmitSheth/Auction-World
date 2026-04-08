import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { user } = useSelector((state) => state.auth);
	const currentUser = user?.user;

	useEffect(() => {
		if (currentUser && currentUser._id) {
			const socketInstance = io(import.meta.env.VITE_API, {
				query: {
					userId: currentUser._id,
				},
			});

			setSocket(socketInstance);

			socketInstance.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			socketInstance.on("userStatusChange", ({ userId, isOnline }) => {
                if(isOnline) {
                    setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
                } else {
                    setOnlineUsers(prev => prev.filter(id => id !== userId));
                }
            });

			return () => socketInstance.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [user]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};

export const useSocketContext = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocketContext must be used within a SocketContextProvider");
	}
	return context;
};
