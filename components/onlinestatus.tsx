import React, { useEffect, useState } from "react";

export const OnlineStatus: React.FC = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        padding: "6px 12px",
        background: online ? "#4CAF50" : "#F44336",
        color: "white",
        borderRadius: "6px",
        fontSize: "14px",
        textAlign: "center",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      {online ? "Online" : "Offline"}
    </div>
  );
};

export default OnlineStatus;
