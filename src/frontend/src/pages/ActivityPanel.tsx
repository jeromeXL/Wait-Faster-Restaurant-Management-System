import { Box, Button, Container, Typography } from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import { ActivityPanelResponse, getActivityPanel } from "../utils/api";
import { useEffect, useState } from "react";
import {
    ActivityPanelUpdatedEventName,
    AssistanceRequestUpdatedEventName,
    NotificationSocket,
} from "../utils/socketIo";
import ActivityPanelTableView from "../components/ActivityPanel/ActivityPanelTableView";
import ActivityPanelOrderView from "../components/ActivityPanel/ActivityPanelOrderView";

const ActivityPanel = () => {
    const [activityPanel, setActivityPanel] =
        useState<ActivityPanelResponse | null>(null);
    const [view, setView] = useState<"Table" | "Order">("Table");

    const fetchActivityPanel = async () => {
        try {
            const response = await getActivityPanel();
            setActivityPanel(response);
        } catch (error) {
            console.error("Failed to fetch activity panel", error);
        }
    };

    useEffect(() => {
        fetchActivityPanel();

        if (!NotificationSocket.connected) {
            NotificationSocket.connect();
        }

        NotificationSocket.on(
            ActivityPanelUpdatedEventName,
            fetchActivityPanel
        );

        NotificationSocket.on(
            AssistanceRequestUpdatedEventName,
            fetchActivityPanel
        );

        return () => {
            NotificationSocket.removeListener(ActivityPanelUpdatedEventName);
            NotificationSocket.removeListener(
                AssistanceRequestUpdatedEventName
            );
        };
    }, []);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                padding: 2,
                alignItems: "center",
                bgcolor: "#121212",
                paddingTop: "20px",
                color: "#E0E0E0",
                background:
                    "linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a1e35, #0f0c33)",
            }}
        >
            <Container maxWidth="lg" className="flex-1">
                <div className="grid grid-cols-3 gap-2 py-1 w-full">
                    <div className="flex justify-start">
                        <Button
                            className="w-max "
                            variant="contained"
                            color="info"
                            onClick={() =>
                                setView(view == "Table" ? "Order" : "Table")
                            }
                        >
                            {view == "Table"
                                ? "Go to Order View"
                                : "Go to Table View"}
                        </Button>
                    </div>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{ color: "#FFF" }}
                        className=" col-start-2 flex justify-center"
                    >
                        Activity Panel
                    </Typography>
                </div>
                {activityPanel == null ? (
                    <div></div>
                ) : (
                    <>
                        {view == "Table" && (
                            <ActivityPanelTableView
                                activityPanel={activityPanel}
                                refreshActivityPanel={fetchActivityPanel}
                            />
                        )}
                        {view == "Order" && (
                            <ActivityPanelOrderView
                                activityPanel={activityPanel}
                                refreshActivityPanel={fetchActivityPanel}
                            />
                        )}
                    </>
                )}
            </Container>
            <ActivityPanelBottomBar />
        </Box>
    );
};

export default ActivityPanel;
