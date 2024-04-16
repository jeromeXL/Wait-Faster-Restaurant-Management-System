import {
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormControl,
    Typography,
} from "@mui/material";
import ActivityPanelBottomBar from "../components/ActivityPanel/ActivityPanelBottomBar";
import {
    ActivityPanelResponse,
    AssistanceRequestStatus,
    OrderItemResponse,
    OrderStatus,
    SessionStatus,
    TableActivityResponse,
    getActivityPanel,
    staffReopenAssistanceRequest,
    staffUpdateAssistanceRequest,
    updateOrderStatus,
} from "../utils/api";
import { useEffect, useState } from "react";
import {
    ActivityPanelUpdatedEventName,
    AssistanceRequestUpdatedEventName,
    NotificationSocket,
} from "../utils/socketIo";
import { FiBell, FiX } from "react-icons/fi";

const ActivityPanel = () => {
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

        if (!NotificationSocket.connected) {
            NotificationSocket.connect();
        }

        NotificationSocket.on(
            ActivityPanelUpdatedEventName,
            fetchActivityPanel
        );

        NotificationSocket.on(
            AssistanceRequestUpdatedEventName,
            fetchActivityPanel
        );

        return () => {
            NotificationSocket.disconnect();
            NotificationSocket.removeListener(ActivityPanelUpdatedEventName);
            NotificationSocket.removeListener(
                AssistanceRequestUpdatedEventName
            );
        };
    }, []);

    // Update order status
    const updateOrderItemStatus = async (
        orderId: string,
        itemId: string,
        status: OrderStatus
    ) => {
        return await updateOrderStatus(orderId, itemId, status).then(() =>
            fetchActivityPanel()
        );
    };

    // Get the apporpriate colour for the assistance request status
    function getAssistanceRequestColour(item: TableActivityResponse) {
        if (item == null) {
            return "white";
        }

        if (
            item.current_session?.assistance_requests.current?.status ==
            AssistanceRequestStatus.OPEN
        ) {
            return "error";
        }

        if (
            item.current_session?.assistance_requests.current?.status ==
            AssistanceRequestStatus.HANDLING
        ) {
            return "secondary";
        }

        return "white";
    }

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
    const onUpdateAssistanceRequestStatus = async (
        dto: TableActivityResponse,
        status: AssistanceRequestStatus
    ) => {
        await staffUpdateAssistanceRequest({
            session_id: dto.current_session!.id!,
            status: status,
        }).then(fetchActivityPanel);
    };
    const formatDateForHoursAndMinutes = (date: Date) => {
        const hrs = date.getHours();
        const mins = date.getMinutes();
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
        )}`;
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
                                    label="READY"
                                    sx={{
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(OrderStatus.READY)
                                    }
                                />
                            </div>
                        )}

                        {orderItem.status == OrderStatus.READY && (
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
                                <Chip label="READY" color="warning" />
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
                                    label="READY"
                                    sx={{
                                        cursor: "warning",
                                    }}
                                    onClick={() =>
                                        setOrderItemToState(OrderStatus.READY)
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
                        {orderItem.status == OrderStatus.READY && (
                            <Chip label="READY" color="warning" />
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
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        p={2}
                        className={`${
                            dto.current_session?.assistance_requests.current &&
                            `bg-${getAssistanceRequestColour(
                                dto
                            )} text-white rounded-t-sm`
                        }`}
                    >
                        <Typography variant="h6">{`Table ${dto?.table_number}`}</Typography>
                        <Button
                            onClick={() => setShowDialog(false)}
                            style={{
                                minWidth: "auto",
                                padding: 0,
                                color: "gray",
                            }}
                        >
                            <FiX
                                className={`text-xl ${
                                    dto.current_session?.assistance_requests
                                        .current && ` text-white `
                                }`}
                            />
                        </Button>
                    </Box>
                    <div className={`px-4`}>
                        {"Started: "}
                        {new Date(
                            dto.current_session?.session_start_time
                        ).toLocaleString()}
                    </div>
                    <Divider
                        sx={{ bgcolor: "grey", height: "1px", mt: "10px" }}
                    />
                    <DialogContent>
                        {dto.current_session.assistance_requests.current && (
                            <Box className="flex gap-2 justify-between">
                                <div className="flex gap-2">
                                    <FiBell className="text-2xl text-error" />
                                    <label className="text-sm">
                                        Assistance
                                    </label>
                                </div>
                                {dto.current_session.assistance_requests.current
                                    ?.status ==
                                    AssistanceRequestStatus.OPEN && (
                                    <div className="flex gap-2">
                                        <Chip label="OPEN" color="error" />
                                        <Chip
                                            label="HANDLING"
                                            className="select-none"
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>
                                                onUpdateAssistanceRequestStatus(
                                                    dto,
                                                    AssistanceRequestStatus.HANDLING
                                                ).then(closeSessionDialog)
                                            }
                                        />
                                    </div>
                                )}
                                {dto.current_session.assistance_requests.current
                                    ?.status ==
                                    AssistanceRequestStatus.HANDLING && (
                                    <div className="flex gap-2">
                                        <Chip
                                            label="OPEN"
                                            className="select-none"
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>
                                                onUpdateAssistanceRequestStatus(
                                                    dto,
                                                    AssistanceRequestStatus.OPEN
                                                ).then(closeSessionDialog)
                                            }
                                        />
                                        <Chip
                                            label="HANDLING"
                                            color="secondary"
                                        />
                                        <Chip
                                            label="CLOSED"
                                            className="select-none"
                                            sx={{ cursor: "pointer" }}
                                            onClick={() =>
                                                onUpdateAssistanceRequestStatus(
                                                    dto,
                                                    AssistanceRequestStatus.CLOSED
                                                ).then(closeSessionDialog)
                                            }
                                        />
                                    </div>
                                )}
                            </Box>
                        )}
                        <Box className="flex flex-col divide-y-2 pb-2">
                            {dto.current_session.orders.length > 0 && (
                                <div>
                                    <div className="flex flex-col gap-3 divide-y-2 divide-gray-300">
                                        {dto.current_session.orders.map(
                                            (order, index) => (
                                                <div
                                                    key={order.id}
                                                    className=" p-2"
                                                >
                                                    <label className="text-sm">{`Order ${
                                                        index + 1
                                                    }`}</label>

                                                    <div className="flex flex-col gap-2">
                                                        {order.items.map(
                                                            (item) => (
                                                                <section
                                                                    key={
                                                                        item.id
                                                                    }
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
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </Box>
                        <Box>
                            {dto.current_session.assistance_requests.handled
                                .length > 0 && (
                                <div className="py-2 border-t border-gray-300">
                                    <Typography>
                                        Assistance Request History
                                    </Typography>
                                    <div>
                                        {dto.current_session.assistance_requests.handled
                                            .sort(
                                                (
                                                    a,
                                                    b // Sort oldest first
                                                ) =>
                                                    a.start_time < b.start_time
                                                        ? 1
                                                        : -1
                                            )
                                            .map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-3 gap-2 items-center justify-between"
                                                >
                                                    <section className="font-bold">
                                                        {index == 0
                                                            ? "LATEST"
                                                            : String(index)}
                                                    </section>
                                                    <section className="py-1">
                                                        {`From ${formatDateForHoursAndMinutes(
                                                            new Date(
                                                                item.start_time
                                                            )
                                                        )} to ${formatDateForHoursAndMinutes(
                                                            new Date(
                                                                item.end_time!
                                                            )
                                                        )}`}
                                                    </section>
                                                    {index == 0 &&
                                                        dto.current_session
                                                            .assistance_requests
                                                            .current ==
                                                            null && (
                                                            <Chip
                                                                label="HANDLING"
                                                                className="select-none"
                                                                sx={{
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() =>
                                                                    staffReopenAssistanceRequest(
                                                                        {
                                                                            session_id:
                                                                                dto.current_session!
                                                                                    .id,
                                                                        }
                                                                    )
                                                                        .then(
                                                                            fetchActivityPanel
                                                                        )
                                                                        .then(
                                                                            closeSessionDialog
                                                                        )
                                                                }
                                                            />
                                                        )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions></DialogActions>
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
                    x?.status == OrderStatus.READY ||
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
                                {`Assistance requests`}
                            </Box>
                        </div>
                        <div className="h-full w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-row gap-4">
                            {activityPanel.tables.map((table) => (
                                <Box
                                    key={table.table_number}
                                    className={`rounded-md text-gray-800 ${
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
                                        className={`p-4 flex justify-between ${getTableTextColour(
                                            table
                                        )}  
                                        ${
                                            table.current_session
                                                ?.assistance_requests.current &&
                                            `bg-${getAssistanceRequestColour(
                                                table
                                            )} text-white rounded-t-md`
                                        }`}
                                    >
                                        <div>{`Table ${table.table_number}`}</div>
                                        <div className="flex items-center ">
                                            {table.current_session
                                                ?.assistance_requests
                                                .current && (
                                                <FiBell
                                                    className={`text-2xl`}
                                                />
                                            )}
                                        </div>
                                    </Typography>
                                    {table.current_session != null ? (
                                        <Box className="flex flex-col py-2">
                                            <div
                                                className={`${getTableTextColour(
                                                    table
                                                )} px-4`}
                                            >
                                                {"Started: "}
                                                {new Date(
                                                    table.current_session?.session_start_time
                                                ).toLocaleString()}
                                            </div>
                                            <Divider
                                                sx={{
                                                    bgcolor: "grey",
                                                    height: "1px",
                                                    mt: "10px",
                                                }}
                                            />
                                            {table.current_session.orders
                                                .length > 0 && (
                                                <div
                                                    className={`px-4 py-2 flex flex-col gap-2 ${getTableTextColour(
                                                        table
                                                    )}`}
                                                >
                                                    {"Orders: "}
                                                    <div className="flex flex-col gap-3 divide-y-2 divide-gray-300">
                                                        {table.current_session.orders.map(
                                                            (order, index) => (
                                                                <div
                                                                    key={
                                                                        order.id
                                                                    }
                                                                    className="p-2"
                                                                >
                                                                    <label className="text-sm">{`Order ${
                                                                        index +
                                                                        1
                                                                    }`}</label>

                                                                    <div className="flex flex-col gap-2">
                                                                        {order.items.map(
                                                                            (
                                                                                item
                                                                            ) => (
                                                                                <section
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                    className="flex justify-between"
                                                                                >
                                                                                    <div className="pr-2 flex items-center">
                                                                                        {
                                                                                            item.menu_item_name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="pl-2">
                                                                                        {item.status ==
                                                                                            OrderStatus.ORDERED && (
                                                                                            <Chip
                                                                                                label="ORDERED"
                                                                                                color="info"
                                                                                            />
                                                                                        )}
                                                                                        {item.status ==
                                                                                            OrderStatus.PREPARING && (
                                                                                            <Chip
                                                                                                label="PREPARING"
                                                                                                color="error"
                                                                                            />
                                                                                        )}
                                                                                        {item.status ==
                                                                                            OrderStatus.READY && (
                                                                                            <Chip
                                                                                                label="READY"
                                                                                                color="warning"
                                                                                            />
                                                                                        )}
                                                                                        {item.status ==
                                                                                            OrderStatus.DELIVERING && (
                                                                                            <Chip
                                                                                                label="DELIVERING"
                                                                                                color="secondary"
                                                                                            />
                                                                                        )}
                                                                                        {item.status ==
                                                                                            OrderStatus.DELIVERED && (
                                                                                            <Chip
                                                                                                label="DELIVERED"
                                                                                                color="success"
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                </section>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Box>
                                    ) : (
                                        <div className="px-4 pb-2">
                                            No active session
                                        </div>
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
            <ActivityPanelBottomBar />
        </Box>
    );
};

export default ActivityPanel;
