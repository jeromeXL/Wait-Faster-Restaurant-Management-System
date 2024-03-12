import axios from "axios";
import { getConfig } from "./config";


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



