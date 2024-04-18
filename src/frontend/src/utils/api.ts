import { UserRole } from "./user";
import { getAxios } from "./useAxios";
import { jwtDecode } from "jwt-decode";
import { Menu, MenuItem } from "./menu";
import { AxiosError } from "axios";

export function isAxiosError(
    err: Error
): err is AxiosError<{ detail: string }> {
    return err.name == "AxiosError";
}

export function stringifyApiError(err: Error): string {
    if (isAxiosError(err)) {
        return (
            err.response?.data["detail"] ??
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

export type MenuItemRequest = {
    name: string;
    price: number;
    description: string;
    health_requirements: string[];
    ingredients: string[];
    photo_url?: string | null;
};
export type MenuItemResponse = {
    id: string;
    name: string;
    price: number;
    description: string;
    health_requirements: string[];
    ingredients: string[];
    photo_url?: string | null;
};

export const createMenuItem = async (req: MenuItemRequest) =>
    await getAxios()
        .put("/menu-item", req)
        .then((resp) => resp.data as MenuItemResponse);
export const editMenuItem = async (id: string, req: MenuItemRequest) =>
    await getAxios()
        .post(`/menu-item/${id}`, req)
        .then((resp) => resp.data as MenuItemResponse);
export const deleteMenuItem = async (id: string) =>
    await getAxios().delete(`/menu-item/${id}`);
export const getMenuItem = async (id: string) =>
    await getAxios().get(`/menu-item/${id}`);

export type ReorderMenuRequest = {
    order: string[];
};
export const reorderMenu = async (req: ReorderMenuRequest) => {
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
        .post("/category/", req)
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

// Sessions
export enum AssistanceRequestStatus {
    OPEN = 0,
    HANDLING = 1,
    CLOSED = 2,
    CANCELLED = 3,
}

export type AssistanceRequest = {
    start_time: string;
    end_time: string | null;
    notes: string | null;
    status: AssistanceRequestStatus;
};
export type SessionResponse = {
    id: string;
    status: SessionStatus;
    orders: OrderResponse[];
    session_start_time: string;
    session_end_time: string;
    assistance_requests: {
        current: AssistanceRequest | null;
        handled: AssistanceRequest[];
    };
};

export const startSession = async () =>
    await getAxios()
        .post("/session/start")
        .then((resp) => resp.data as SessionResponse);

export const getSession = async () =>
    await getAxios()
        .get("/table/session")
        .then((resp) => resp.data as SessionResponse);

export const lockSession = async () =>
    await getAxios()
        .post("/session/lock")
        .then((resp) => resp.data as SessionResponse);

export const completeSession = async (tableName: string) =>
    await getAxios().post(`/session/complete/${tableName}`);

// Sessions - Help requests.
export const createAssistanceRequest = async () =>
    await getAxios()
        .put("/session/assistance-request/create")
        .then((resp) => resp.data as SessionResponse);

export type StaffUpdateAssistanceRequest = {
    session_id: string;
    status: AssistanceRequestStatus;
};
export const staffUpdateAssistanceRequest = async (
    request: StaffUpdateAssistanceRequest
) =>
    await getAxios()
        .put("/session/assistance-request/staff-update", request)
        .then((resp) => resp.data as SessionResponse);

export type StaffReopenAssistanceRequest = {
    session_id: string;
};
export const staffReopenAssistanceRequest = async (
    req: StaffReopenAssistanceRequest
) =>
    await getAxios()
        .put("/session/assistance-request/staff-reopen", req)
        .then((resp) => resp.data as SessionResponse);

export const tabletResolveAssistanceRequest = async () =>
    await getAxios()
        .put("/session/assistance-request/tablet-resolve")
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

export type CreateOrderItemRequest = {
    menu_item_id: string;
    is_free: boolean;
    preferences: string[];
    additional_notes: string;
};
export type CreateOrderRequest = {
    session_id: string;
    items: CreateOrderItemRequest[];
};
export const MakeOrder = async (req: CreateOrderRequest) =>
    await getAxios().post("/order", req);
