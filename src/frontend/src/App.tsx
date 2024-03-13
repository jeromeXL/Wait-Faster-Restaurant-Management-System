import './App.css'
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import ManagerMenu from "./pages/ManagerMenu"
import AdminRoute from './components/AdminRoute';
import Logout from './components/Logout';

function App() {

  return (
    <>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/admin' element={
			  //<AdminRoute>
              <Admin />
			  //</AdminRoute>
			} />
          <Route path="/logout" element={<Logout />} />
		  <Route path='/manager/menu' element={<ManagerMenu />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
