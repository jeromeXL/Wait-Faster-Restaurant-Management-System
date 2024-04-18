import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import loginBG from "../assets/LoginBG.mp4";
import WFLogo from "../assets/WFLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginRequest, login } from "../utils/api";
import { UserRole } from "../utils/user";
import Typewriter from "typewriter-effect";
import { NotificationSocket } from "../utils/socketIo";

const Login = () => {
    const [credentials, setCredentials] = useState<LoginRequest>({
        username: "",
        password: "",
    });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        NotificationSocket.connect();
        try {
            const response = await login(credentials);
            console.log(response);
            switch (response.role) {
                case UserRole.USER_ADMIN:
                    navigate("/admin");
                    break;
                case UserRole.MANAGER:
                    navigate("/activity-panel");
                    break;
                case UserRole.WAIT_STAFF:
                    navigate("/activity-panel");
                    break;
                case UserRole.KITCHEN_STAFF:
                    navigate("/kitchen");
                    break;
                case UserRole.CUSTOMER_TABLET:
                    navigate("/start");
                    break;
                default:
                    navigate("/");
            }
        } catch (error: any) {
            console.error(
                "Login error:",
                error.response?.data?.detail || "Unknown error"
            );
            setError(
                error.response?.data?.detail || "An unknown error occurred"
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
                <Typography variant="h5">
                    <Typewriter
                        options={{
                            strings: [
                                "Welcome to WaitFaster.",
                                "Fast. Efficient. Unmatched.",
                                "Dine Smarter, Not Harder.",
                                "Where Waiting Ends and Dining Begins.",
                            ],
                            autoStart: true,
                            loop: true,
                            deleteSpeed: 80,
                        }}
                    />
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        name="username"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        onChange={handleChange}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: "20px" }}
                    >
                        Login
                    </Button>
                </form>
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

export default Login;
