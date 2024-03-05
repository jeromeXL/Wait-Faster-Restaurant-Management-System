import { Box, Button, Container, TextField, Typography } from "@mui/material";
import loginBG from '../assets/LoginBG.mp4';
import WFLogo from '../assets/WFLogo.png';

const Login = () => {
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
        <Typography variant="h5">Welcome to WaitFaster</Typography>
        <form>
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: "20px" }}>
            Login
          </Button>
        </form>
      </Container>
    </Box>
  )
}

export default Login;
