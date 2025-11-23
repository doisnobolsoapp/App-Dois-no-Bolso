import React, { useEffect, useState } from 'react';


export const OnlineStatus: React.FC = () => {
const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);


useEffect(() => {
const onOnline = () => setIsOnline(true);
const onOffline = () => setIsOnline(false);
window.addEventListener('online', onOnline);
window.addEventListener('offline', onOffline);
return () => {
window.removeEventListener('online', onOnline);
window.removeEventListener('offline', onOffline);
};
}, []);


if (typeof window === 'undefined') return null;
