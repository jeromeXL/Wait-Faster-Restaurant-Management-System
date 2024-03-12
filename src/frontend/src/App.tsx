import './App.css'
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'
import Menu from './pages/Menu'
import Admin from './pages/Admin'
import AdminRoute from './components/AdminRoute';

function App() {

  return (
    <>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/menu' element={<Menu />} />
          <Route path='/admin' element={
            //<AdminRoute>
              <Admin />
            //</AdminRoute>
          } />
        </Routes>
      </Router>
    </>
  )
}

export default App
