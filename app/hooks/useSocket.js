import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInitializer = async () => {
            // 1. Pehle API ko hit karke server jagaao
            await fetch('/api/socket');
            
            // 2. Phir connect karo
            const socketInstance = io({
                path: '/api/socket',
            });

            socketInstance.on('connect', () => {
                console.log('Front-end connected to Socket!');
            });

            setSocket(socketInstance);
        };

        socketInitializer();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    return socket;
};