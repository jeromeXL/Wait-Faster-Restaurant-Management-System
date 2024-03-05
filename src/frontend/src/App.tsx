import './App.css'
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'

function App() {

  return (
    <>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
