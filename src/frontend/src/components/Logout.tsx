import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationSocket } from "../utils/socketIo";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        NotificationSocket.disconnect();
        navigate("/");
    }, [navigate]);

    return null;
};

export default Logout;
