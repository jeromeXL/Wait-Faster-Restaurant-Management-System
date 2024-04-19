import { Box, Typography } from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import { TodoBoard } from "../components/TodoBoard";
import { useLocation } from "react-router-dom";
import KitchenBottomBar from "../components/KitchenBottomBar";

const NoticeBoard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get('source');
  const refreshOrders = () => {};

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
                background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a1e35, #0f0c33)',
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ color: "#FFF" }}>
                Notice Board
            </Typography>
            <TodoBoard />
            {source === 'kitchen' ? <KitchenBottomBar refreshOrders={refreshOrders}/> : <ActivityPanelBottomBar />}
        </Box>
    );
};

export default NoticeBoard;
