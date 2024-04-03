import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import {
    ActivityPanelResponse,
    OrderStatus,
    SessionStatus,
    TableActivityResponse,
    getActivityPanel,
    getMenuItems,
} from "../utils/api";
import { useEffect, useState } from "react";
import { MenuItem } from "../utils/menu";
import { json } from "react-router-dom";

const ActivityPanel = () => {
    const [activityPanel, setActivityPanel] =
        useState<ActivityPanelResponse | null>(null);
    const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>();

    const fetchActivityPanel = async () => {
        try {
            const response = await getActivityPanel();
            setActivityPanel(response);

            const menuItems = await getMenuItems();
            // Map to a map
            const map: Record<string, MenuItem> = {};
            menuItems.forEach((element) => {
                map[element.id] = element;
            });

            setMenuItems(map);
        } catch (error) {
            console.error("Failed to fetch activity panel", error);
        }
    };

    useEffect(() => {
        fetchActivityPanel();
    }, []);

    // Session Dialog
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [lastClickedTable, setLastClickedTable] =
        useState<TableActivityResponse | null>(null);
    const onClickTableWithSession = (table: TableActivityResponse) => {
        setShowDialog(true);
        setLastClickedTable(table);
    };
    const closeSessionDialog = () => {
        setShowDialog(false);
    };
    const strigifyOrderStatus = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.ORDERED:
                return "ORDERED";
            case OrderStatus.PREPARING:
                return "PREPARING";
            case OrderStatus.COMPLETE:
                return "COMPLETE";
            case OrderStatus.DELIVERING:
                return "DELIVERING";
            case OrderStatus.DELIVERED:
                return "DELIVERED";
        }
    };

    const SessionDialog = ({
        dto,
        showDialog,
        onClose,
    }: {
        dto: TableActivityResponse;
        showDialog: boolean;
        onClose: () => void;
    }) => {
        return (
            dto != null &&
            dto.current_session != null && (
                <Dialog open={showDialog} onClose={onClose}>
                    <DialogTitle className="select-none">{`Table ${dto?.table_number}`}</DialogTitle>
                    <DialogContent>
                        <Box className="flex flex-col pb-2 divide-y-2">
                            <div className={`p-2`}>
                                {"Started: "}
                                {new Date(
                                    dto.current_session?.session_start_time
                                ).toLocaleString()}
                            </div>
                            {dto.current_session.orders.length > 0 && (
                                <div className={`p-2`}>
                                    <div>
                                        {dto.current_session.orders.map(
                                            (order, index) => (
                                                <div>
                                                    <label>{`Order ${
                                                        index + 1
                                                    }`}</label>
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th className="text-start px-2">
                                                                    Item
                                                                </th>
                                                                <th className="text-start px-2">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.items.map(
                                                                (item) => (
                                                                    <tr
                                                                        key={
                                                                            item.id
                                                                        }
                                                                    >
                                                                        <td className="px-2">
                                                                            {
                                                                                menuItems![
                                                                                    item
                                                                                        .menu_item_id
                                                                                ]
                                                                                    ?.name
                                                                            }
                                                                        </td>
                                                                        <td className="px-2">
                                                                            {strigifyOrderStatus(
                                                                                item.status
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        {/* <Button onClick={onDelete} color="error">
                    Delete
                </Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>Confirm</Button> */}
                    </DialogActions>
                </Dialog>
            )
        );
    };

    // Display functions
    const getTableBackgroundColour = (dto: TableActivityResponse) => {
        if (dto.current_session == null) {
            return "white";
        }

        switch (dto.current_session?.status) {
            case SessionStatus.OPEN:
                return "primary.main";
            case SessionStatus.AWAITING_PAYMENT:
                return "secondary.main";
            case SessionStatus.CLOSED:
                return "white";
        }
    };

    const getTableTextColour = (dto: TableActivityResponse) => {
        if (dto.current_session == null) {
            return "text-black";
        }

        switch (dto.current_session?.status) {
            case SessionStatus.OPEN:
                return "text-white";
            case SessionStatus.AWAITING_PAYMENT:
                return "secondary.contrastText";
            case SessionStatus.CLOSED:
                return "text-black";
        }
    };

    const ordersInKitchen = () =>
        activityPanel?.tables
            .flatMap((x) => x.current_session?.orders)
            .filter(
                (x) =>
                    x?.status == OrderStatus.PREPARING ||
                    x?.status == OrderStatus.ORDERED
            ).length;

    const ordersToBeDeliveredOrDelivering = () =>
        activityPanel?.tables
            .flatMap((x) => x.current_session?.orders)
            .filter(
                (x) =>
                    x?.status == OrderStatus.COMPLETE ||
                    x?.status == OrderStatus.DELIVERING
            ).length;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                padding: 2,
                alignItems: "center",
                bgcolor: "#121212",
                paddingTop: "20px",
                color: "#E0E0E0",
                background: `linear-gradient(to bottom right, #121212, #2C2C2C)`,
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ color: "#FFF" }}>
                Activity Panel
            </Typography>
            <Container maxWidth="lg" className="flex-1">
                {activityPanel == null ? (
                    <>No content</>
                ) : (
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex gap-4">
                            <Box
                                className="w-full text-black p-2 rounded-md text-center"
                                sx={{ bgcolor: "white" }}
                            >
                                <p className="text-xl">{ordersInKitchen()}</p>
                                {`Orders in the kitchen`}
                            </Box>
                            <Box
                                className="w-full text-black p-2 rounded-md text-center"
                                sx={{ bgcolor: "white" }}
                            >
                                <p className="text-xl">
                                    {ordersToBeDeliveredOrDelivering()}
                                </p>
                                {`Orders to be delivered`}
                            </Box>
                            <Box
                                className="w-full text-black p-2 rounded-md text-center"
                                sx={{ bgcolor: "white" }}
                            >
                                <p className="text-xl">0</p>
                                {`Help requests`}
                            </Box>
                        </div>
                        <div className="h-full w-full grid grid-cols-3 md:grid-cols-4 grid-flow-row gap-4">
                            {activityPanel.tables.map((table) => (
                                <Box
                                    className={`rounded-md text-gray-800 p-4 ${
                                        table.current_session != null &&
                                        "cursor-pointer hover:brightness-95"
                                    }`}
                                    sx={{
                                        bgcolor:
                                            getTableBackgroundColour(table),
                                    }}
                                    onClick={() => {
                                        if (table.current_session != null)
                                            onClickTableWithSession(table);
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        className={`p-2 ${getTableTextColour(
                                            table
                                        )}`}
                                    >{`Table ${table.table_number}`}</Typography>
                                    {table.current_session != null ? (
                                        <Box className="flex flex-col pb-2 divide-y-2">
                                            <div
                                                className={`p-2 ${getTableTextColour(
                                                    table
                                                )}`}
                                            >
                                                {"Started: "}
                                                {new Date(
                                                    table.current_session?.session_start_time
                                                ).toLocaleString()}
                                            </div>
                                            {table.current_session.orders
                                                .length > 0 && (
                                                <div
                                                    className={`p-2 ${getTableTextColour(
                                                        table
                                                    )}`}
                                                >
                                                    {"Orders: "}
                                                    {
                                                        table.current_session
                                                            ?.orders.length
                                                    }
                                                </div>
                                            )}
                                        </Box>
                                    ) : (
                                        <div>No active session</div>
                                    )}
                                </Box>
                            ))}
                        </div>
                    </div>
                )}
            </Container>
            <SessionDialog
                showDialog={showDialog}
                onClose={closeSessionDialog}
                dto={lastClickedTable!}
            />
            <ActivityPanelBottomBar refresh={fetchActivityPanel} />
        </Box>
    );
};

export default ActivityPanel;
