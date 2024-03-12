import axios from "axios";
import { getConfig } from "./config";
import { jwtDecode } from 'jwt-decode';
import { UserRole } from "./models/user";

const getAuthToken = () => localStorage.getItem("accessToken");
const instance = axios.create({
    baseURL: getConfig().API_URL,
});
instance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Barer ${token}`;
    }

    return config;
});

export const getAxios = () => instance;


export interface DecodedToken {
	exp: number,
	iat: number,
	jti: string,
	subject: {
		userId: string;
		role: UserRole;
	},
	type: string
}



