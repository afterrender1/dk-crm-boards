"use client"
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useSocket Hook
 * Yeh hook Socket.io client ko initialize karta hai aur connection manage karta hai.
 */
export const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketInitializer = async () => {
            // 1. Backend trigger karna
            // Next.js (Pages API) mein socket server ko start karne ke liye 
            // pehle us endpoint ko fetch karna zaroori hai.
            await fetch('/api/socket');

            // 2. Socket connection establish karna
            // Hum 'io()' ko bina URL ke call kar rahe hain taake wo same domain use kare
            const socketInstance = io(undefined, {
                path: '/api/socket', // Yeh path aapke backend 'path' se match hona chahiye
                addTrailingSlash: false,
            });

            // Connection events monitor karna
            socketInstance.on('connect', () => {
                console.log('✅ Connected to Socket Server - ID:', socketInstance.id);
            });

            socketInstance.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err.message);
            });

            setSocket(socketInstance);
        };

        // Initializer ko run karein
        socketInitializer();

        // 3. Cleanup: Jab component unmount ho toh disconnect kar dein
        return () => {
            if (socket) {
                console.log('🔌 Disconnecting Socket...');
                socket.disconnect();
            }
        };
    }, []);

    return socket;
};