import "./App.css";
import { CssBaseline } from "@mui/material";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ManagerMenu from "./pages/ManagerMenu";
import AdminRoute from "./components/AdminRoute";
import Logout from "./components/Logout";
import ManagerItems from "./pages/ManagerItems";
import StartSession from "./pages/StartSession";
import ActivityPanel from "./pages/ActivityPanel";
import Kitchen from "./pages/Kitchen";
import CustomerMenu from "./pages/CustomerMenu";
import EndPage from "./pages/endPage";
import NoticeBoard from "./pages/NoticeBoard";
import { useEffect } from "react";
import { NotificationSocket } from "./utils/socketIo";

function App() {

    useEffect(() => {
        NotificationSocket.connect()

        return () => {
            NotificationSocket.disconnect()
        }
    }, [])

    return (
        <>
            <Router>
                <CssBaseline />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/start" element={<StartSession />} />
                    <Route path="/menu" element={<CustomerMenu />} />
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
                    <Route path="/activity-panel" element={<ActivityPanel />} />
                    <Route path="/kitchen" element={<Kitchen />} />
                    <Route path="/end" element={<EndPage />} />
                    <Route path="/notice-board" element={<NoticeBoard />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
