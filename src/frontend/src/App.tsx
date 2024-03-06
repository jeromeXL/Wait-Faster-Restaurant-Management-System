import './App.css'
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'
import Menu from './pages/Menu'
import Cart from './pages/Cart'

function App() {

  return (
    <>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/Menu' element={<Menu />} />
          <Route path='/Cart' element={<Cart />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
