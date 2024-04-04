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

export enum OrderStatus {
    ORDERED = 0,
    PREPARING = 1,
    READY = 2,
    DELIVERING = 3,
    DELIVERED = 4,
}
export type OrderItemResponse = {
    id: string;
    status: OrderStatus;
    menu_item_id: string;
    menu_item_name: string;
    is_free: boolean;
    preferences?: string[];
    additional_notes?: string;
};
export type OrderResponse = {
    id: string;
    status: OrderStatus;
    session_id: string;
    items: OrderItemResponse[];
};

export enum SessionStatus {
    OPEN = 0,
    AWAITING_PAYMENT = 1,
    CLOSED = 2,
}

export type SessionResponse = {
    id: string;
    status: SessionStatus;
    orders: OrderResponse[];
    session_start_time: string;
    session_end_time: string;
};

export const apiStartSession = async () =>
    await getAxios()
        .post("/session/start")
        .then((resp) => resp.data as SessionResponse);

// Activity Panel
export type TableActivityResponse = {
    table_number: number;
    current_session: SessionResponse | null;
};
export type ActivityPanelResponse = {
    tables: TableActivityResponse[];
};
export const getActivityPanel = async () =>
    await getAxios()
        .get("/activity")
        .then((resp) => resp.data as ActivityPanelResponse);

// Update a singular order item
export const updateOrderStatus = async (
    orderId: string,
    itemId: string,
    status: OrderStatus
) => await getAxios().post(`/order/${orderId}/${itemId}`, { status });
