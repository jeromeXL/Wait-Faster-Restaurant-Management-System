import { Box, Typography } from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import { TodoBoard } from "../components/TodoBoard";
const NoticeBoard = () => {
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
            <ActivityPanelBottomBar />
        </Box>
    );
};

export default NoticeBoard;
