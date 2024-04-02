import "./App.css";
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import ManagerMenu from "./pages/ManagerMenu";
import AdminRoute from "./components/AdminRoute";
import Logout from "./components/Logout";
import ManagerItems from "./pages/ManagerItems";
import StartSession from "./pages/StartSession";

function App() {
    return (
        <>
            <Router>
                <CssBaseline />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/start" element={<StartSession />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin />
                            </AdminRoute>
                        }
                    />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/manager/menu" element={<ManagerMenu />} />
                    <Route path="/manager/items" element={<ManagerItems />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
