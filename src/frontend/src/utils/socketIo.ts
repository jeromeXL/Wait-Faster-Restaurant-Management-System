import { io } from "socket.io-client";
import { getConfig } from "./config";

const config = getConfig();
const token = localStorage.getItem("accessToken");
export const NotificationSocket = io(`${config.API_URL}`, {
    autoConnect: false,
    auth: { Authorization: `Bearer ${token}` },
});

NotificationSocket.on("connect", onConnect);
NotificationSocket.on("disconnect", onDisconnect);

function onConnect() {
    console.log("Connected!");
}

function onDisconnect() {
    console.log("Disconnected");
}

export const ActivityPanelUpdatedEventName = "activity_panel_updated";
export const AssistanceRequestUpdatedEventName = "assistance_request_update";
