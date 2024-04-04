import {
    Box,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Typography,
} from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import {
    ActivityPanelResponse,
    OrderItemResponse,
    OrderResponse,
    OrderStatus,
    SessionStatus,
    TableActivityResponse,
    getActivityPanel,
    updateOrderStatus,
} from "../utils/api";
import { useEffect, useState } from "react";
import { UserRole, useAuth } from "../utils/user";

const ActivityPanel = () => {
    const auth = useAuth();
    const [activityPanel, setActivityPanel] =
        useState<ActivityPanelResponse | null>(null);

    const fetchActivityPanel = async () => {
        try {
            const response = await getActivityPanel();
            setActivityPanel(response);
        } catch (error) {
            console.error("Failed to fetch activity panel", error);
        }
    };

    useEffect(() => {
        fetchActivityPanel();
    }, []);

    // Update order status
    const updateOrderItemStatus = async (
        orderId: string,
        itemId: string,
        status: OrderStatus
    ) => {
        console.log("here");
        return await updateOrderStatus(orderId, itemId, status).then(() =>
            fetchActivityPanel()
        );
    };

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

    const OrderItemRadioGroup = ({
        orderItem,
        setOrderItemToState,
    }: {
        orderItem: OrderItemResponse;
        setOrderItemToState: (state: OrderStatus) => Promise<unknown>;
    }) => {
        const can_modify_current_order_status =
            orderItem.status != OrderStatus.DELIVERED;

        return (
            <div>
                {can_modify_current_order_status && (
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">
                            Update Status:
                        </FormLabel>

                        {orderItem.status == OrderStatus.ORDERED && (
                            <div className="flex gap-2">
                                <Chip label="ORDERED" color="info" />
                                <Chip
                                    label="PREPARING"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.PREPARING
                                        )
                                    }
                                />
                            </div>
                        )}

                        {orderItem.status == OrderStatus.PREPARING && (
                            <div className="flex gap-2">
                                <Chip label="PREPARING" color="error" />
                                <Chip
                                    label="COMPLETE"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.COMPLETE
                                        )
                                    }
                                />
                            </div>
                        )}

                        {orderItem.status == OrderStatus.COMPLETE && (
                            <div className="flex gap-2">
                                <Chip
                                    label="PREPARING"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.PREPARING
                                        )
                                    }
                                />
                                <Chip label="COMPLETE" color="warning" />
                                <Chip
                                    label="DELIVERING"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.DELIVERING
                                        )
                                    }
                                />
                            </div>
                        )}

                        {orderItem.status == OrderStatus.DELIVERING && (
                            <div className="flex gap-2">
                                <Chip
                                    label="COMPLETE"
                                    sx={{
                                        cursor: "warning",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.COMPLETE
                                        )
                                    }
                                />
                                <Chip label="DELIVERING" color="secondary" />
                                <Chip
                                    label="DELIVERED"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(
                                            OrderStatus.DELIVERED
                                        )
                                    }
                                />
                            </div>
                        )}
                    </FormControl>
                )}
                {!can_modify_current_order_status && (
                    <>
                        {orderItem.status == OrderStatus.ORDERED && (
                            <Chip label="ORDERED" color="info" />
                        )}
                        {orderItem.status == OrderStatus.PREPARING && (
                            <Chip label="PREPARING" color="error" />
                        )}
                        {orderItem.status == OrderStatus.COMPLETE && (
                            <Chip label="COMPLETE" color="warning" />
                        )}
                        {orderItem.status == OrderStatus.DELIVERING && (
                            <Chip label="DELIVERING" color="secondary" />
                        )}
                        {orderItem.status == OrderStatus.DELIVERED && (
                            <Chip label="DELIVERED" color="success" />
                        )}
                    </>
                )}
            </div>
        );
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
                                <div className={`py-2`}>
                                    <div>
                                        {dto.current_session.orders.map(
                                            (order, index) => (
                                                <div key={order.id}>
                                                    <label>{`Order ${
                                                        index + 1
                                                    }`}</label>

                                                    {order.items.map((item) => (
                                                        <section
                                                            key={item.id}
                                                            className="flex justify-between"
                                                        >
                                                            <div className="pr-2 flex items-center">
                                                                {
                                                                    item.menu_item_name
                                                                }
                                                            </div>
                                                            <div className="pl-2">
                                                                <OrderItemRadioGroup
                                                                    orderItem={
                                                                        item
                                                                    }
                                                                    setOrderItemToState={(
                                                                        state
                                                                    ) => {
                                                                        return updateOrderItemStatus(
                                                                            order.id,
                                                                            item.id,
                                                                            state
                                                                        ).then(
                                                                            onClose
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                        </section>
                                                    ))}
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
            return "bg-white brightness-75";
        }

        switch (dto.current_session?.status) {
            case SessionStatus.OPEN:
                return "bg-white";
            case SessionStatus.AWAITING_PAYMENT:
                return "bg-blue-200";
            case SessionStatus.CLOSED:
                return "bg-white";
        }
    };

    const getTableTextColour = (dto: TableActivityResponse) => {
        if (dto.current_session == null) {
            return "text-black";
        }

        switch (dto.current_session?.status) {
            case SessionStatus.OPEN:
                return "text-black";
            case SessionStatus.AWAITING_PAYMENT:
                return "text-white";
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

    const OrderStatusBadges = ({ order }: { order: OrderResponse }) => {
        return (
            <>
                {order.status == OrderStatus.ORDERED && (
                    <Chip label="ORDERED" color="info" />
                )}
                {order.status == OrderStatus.PREPARING && (
                    <Chip label="PREPARING" color="error" />
                )}
                {order.status == OrderStatus.COMPLETE && (
                    <Chip label="COMPLETE" color="warning" />
                )}
                {order.status == OrderStatus.DELIVERING && (
                    <Chip label="DELIVERING" color="secondary" />
                )}
                {order.status == OrderStatus.DELIVERED && (
                    <Chip label="DELIVERED" color="success" />
                )}
            </>
        );
    };

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
                            <Box className="w-full text-black p-2 rounded-md text-center bg-info">
                                <p className="text-xl">{ordersInKitchen()}</p>
                                {`Orders in the kitchen`}
                            </Box>
                            <Box className="w-full text-black p-2 rounded-md text-center bg-warning-light">
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
                                    key={table.table_number}
                                    className={`rounded-md text-gray-800 p-4 ${
                                        table.current_session != null &&
                                        "cursor-pointer hover:brightness-95"
                                    } ${getTableBackgroundColour(table)}`}
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
                                                    className={`p-2 flex flex-col gap-2 ${getTableTextColour(
                                                        table
                                                    )}`}
                                                >
                                                    {"Orders: "}
                                                    {table.current_session.orders.map(
                                                        (order, index) => (
                                                            <div
                                                                key={order.id}
                                                                className="flex flex-row justify-between"
                                                            >
                                                                <div className="flex items-center">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex flex-row">
                                                                    <OrderStatusBadges
                                                                        order={
                                                                            order
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
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
