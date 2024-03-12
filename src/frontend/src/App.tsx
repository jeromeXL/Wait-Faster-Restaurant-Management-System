import './App.css'
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'
import Menu from './pages/Menu'
import Admin from './pages/Admin'
import AdminRoute from './components/AdminRoute';
import Logout from './components/Logout';
import Cart from './pages/Cart'

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
