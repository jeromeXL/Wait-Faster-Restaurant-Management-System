import { ReoderMenuRequest } from "./api";
import { UserRole } from "./user";
import { getAxios } from "./useAxios";
import { jwtDecode } from "jwt-decode";
import { Menu, MenuItem } from "./menu";
import { AxiosError } from "axios";

export function isAxiosError(err: Error): err is AxiosError {
    return err.name == "AxiosError";
}

export function stringifyApiError(err: Error): string {
    if (isAxiosError(err)) {
        return (
            err.response?.data?.detail ??
            "Something went wrong while trying to contact the database."
        );
    }
    return err.message;
}

export interface AuthTokens {
    access_token: string;
    access_token_expires: string;
    refresh_token: string;
    refresh_token_expires?: string;
}
export interface DecodedToken {
    exp: number;
    iat: number;
    jti: string;
    subject: {
        userId: string;
        role: UserRole;
    };
    type: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export const login = async (request: LoginRequest) => {
    const response = await getAxios().post<AuthTokens>("/auth/login", request);
    const { access_token, refresh_token } = response.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    // Decode the JWT to get the user's role
    const decodedToken: DecodedToken = jwtDecode<DecodedToken>(access_token);
    localStorage.setItem("userRole", String(decodedToken.subject.role));
    return decodedToken.subject;
};

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthTokens {
    access_token: string;
    access_token_expires: string;
    refresh_token: string;
    refresh_token_expires?: string;
}

export type GetMenuResponse = {
    Menu: Menu;
    Items: Record<string, MenuItem>;
};
export const getMenu = async () => {
    const response = await getAxios().get("/menu");
    return response.data as GetMenuResponse;
};

export const getMenuItems = async () => {
    const response = await getAxios().get("/menu-items");
    return response.data as MenuItem[];
};

export type CreateMenuItemRequest = {
    name: string;
    price: number;
    description: string;
    health_requirements: string[];
};
export type MenuItemResponse = {
    id: string;
    name: string;
    price: number;
    health_requirements: string[];
    description: string;
};

export const createMenuItem = async (req: CreateMenuItemRequest) =>
    await getAxios()
        .post("/menu-item", req)
        .then((resp) => resp.data as MenuItemResponse);
export const editMenuItem = async (id: string, req: CreateMenuItemRequest) =>
    await getAxios()
        .put(`/menu-item/${id}`, req)
        .then((resp) => resp.data as MenuItemResponse);
export const deleteMenuItem = async (id: string) =>
    await getAxios().delete(`/menu-item/${id}`);

export type ReorderMenuRequest = {
    order: string[];
};
export const reorderMenu = async (req: ReoderMenuRequest) => {
    const response = await getAxios().put("/menu/reorder", req);
    return response.data as GetMenuResponse;
};

export type CreateCategoryRequest = {
    name: string;
    menu_items: string[];
};
export type CategoryResponse = {
    id: string;
    name: string;
    menu_items: string[];
    index: number;
};
export const createCategory = async (req: CreateCategoryRequest) =>
    await getAxios()
        .post("/category", req)
        .then((resp) => resp.data as CategoryResponse);

export const updateCategory = async (id: string, req: CreateCategoryRequest) =>
    await getAxios()
        .put(`/category/${id}`, req)
        .then((resp) => resp.data as CategoryResponse);

export const deleteCategory = async (id: string) =>
    await getAxios().delete(`/category/${id}`);
