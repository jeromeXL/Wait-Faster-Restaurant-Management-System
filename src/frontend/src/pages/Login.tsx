import { Box, Button, Container, TextField, Typography, Snackbar, Alert } from "@mui/material";
import loginBG from '../assets/LoginBG.mp4';
import WFLogo from '../assets/WFLogo.png';
import axios from 'axios';
import { useState } from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthTokens {
  access_token: string;
  access_token_expires: string;
  refresh_token: string;
  refresh_token_expires?: string;
}

enum UserRole {
  USER_ADMIN = 1,
  MANAGER = 2,
  WAIT_STAFF = 3,
  KITCHEN_STAFF = 4,
  CUSTOMER_TABLET = 5,
}

interface DecodedToken {
  userId: string;
  role: UserRole;
}

const Login = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({ username: '', password: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.post<AuthTokens>('backendURL/auth/login', credentials);
      const { access_token, refresh_token } = response.data;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // Decode the JWT to get the user's role
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(access_token);
      localStorage.setItem('userRole', decodedToken.role.toString());

      switch (decodedToken.role) {
        case UserRole.USER_ADMIN:
          navigate('/admin');
          break;
        case UserRole.MANAGER:
          navigate('/manager');
          break;
        case UserRole.WAIT_STAFF:
          navigate('/wait_staff');
          break;
        case UserRole.KITCHEN_STAFF:
          navigate('/kitchen_staff');
          break;
        case UserRole.CUSTOMER_TABLET:
          navigate('/menu');
          break;
        default:
          navigate('/');
      }

    } catch (error: any) {
      console.error('Login error:', error.response?.data?.detail || 'Unknown error');
      setError(error.response?.data?.detail || 'An unknown error occurred');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        className='loginVideo'
        component="video"
        autoPlay
        loop
        muted
        playsInline
        src={loginBG}
        sx={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      <Container
        sx={{
          position: 'relative',
          width: "600px",
          bgcolor: 'rgba(245, 243, 240, 0.95)',
          borderRadius: 10,
          display: "flex",
          padding: 5,
          gap: "20px",
          alignItems: 'center',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 2,
        }}
      >
        <Box
          component="img"
          src={WFLogo}
          sx={{
            height: "200px"
          }}
        />
        <Typography variant="h5">Welcome to WaitFaster.</Typography>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "20px" }}>
            Login
          </Button>
        </form>
      </Container>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Login;
