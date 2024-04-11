import { Box, Container, Typography } from '@mui/material';

const EndPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      }}
    >
      <Container
        sx={{
          textAlign: 'center',
          color: 'white',
          padding: 4,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You for Eating with Us
        </Typography>
        <Typography variant="subtitle1">
          We hope you had a great experience. See you again soon!
        </Typography>
      </Container>
    </Box>
  );
};

export default EndPage;
