import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "./api";

export enum UserRole {
    USER_ADMIN = 1,
    MANAGER = 2,
    WAIT_STAFF = 3,
    KITCHEN_STAFF = 4,
    CUSTOMER_TABLET = 5,
}

export function useAuth() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
        return {
            isRole: (userRole: UserRole) =>
                decodedToken.subject.role == userRole,
        };
    } catch (error) {
        return null;
    }
}
