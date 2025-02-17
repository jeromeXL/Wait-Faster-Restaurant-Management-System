import {
    Box,
    Button,
    Container,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import loginBG from "../assets/LoginBG.mp4";
import WFLogo from "../assets/WFLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, startSession } from "../utils/api";

const StartSession = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleStartSession = async () => {
        console.log("Start Session button pressed");

        try {
            const sessionResponse = await getSession();

            // Assuming sessionResponse would include a session indicator, adjust based on your actual API response
            if (sessionResponse == null) {
                console.log("No active session found, starting a new one");
                // No active session found, proceed to start a new session
                const startSessionResponse = await startSession();
                console.log(startSessionResponse);
                navigate("/menu");
            } else {
                console.log("Active session found, navigating to menu");
                // Active session exists, navigate to "/menu"
                navigate("/menu");
            }
        } catch (error: any) {
            console.error(
                "Error starting session: ",
                error.response?.data?.detail || "Unknown error"
            );
            setError(
                error.response?.data?.detail || "An unknown error occured"
            );
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (
        _event: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Box
                className="loginVideo"
                component="video"
                autoPlay
                loop
                muted
                playsInline
                src={loginBG}
                sx={{
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                    objectFit: "cover",
                    zIndex: 1,
                }}
            />
            <Container
                sx={{
                    position: "relative",
                    width: "600px",
                    bgcolor: "rgba(245, 243, 240, 0.95)",
                    borderRadius: 10,
                    display: "flex",
                    padding: 5,
                    gap: "20px",
                    alignItems: "center",
                    flexDirection: "column",
                    overflowY: "auto",
                    zIndex: 2,
                    margin: 2,
                }}
            >
                <Box
                    component="img"
                    src={WFLogo}
                    sx={{
                        height: "200px",
                    }}
                />
                <Typography variant="h5">Welcome to WaitFaster.</Typography>
                <Button
                    onClick={handleStartSession}
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: "20px" }}
                >
                    Start Session
                </Button>
            </Container>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StartSession;
