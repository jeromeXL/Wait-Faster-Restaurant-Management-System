import { FC, useState } from "react";
import {
    ActivityPanelResponse,
    AssistanceRequestStatus,
    OrderStatus,
    SessionStatus,
    TableActivityResponse,
    completeSession,
    staffReopenAssistanceRequest,
    staffUpdateAssistanceRequest,
    updateOrderStatus,
} from "../../utils/api";
import {
    Typography,
    Divider,
    Box,
    DialogActions,
    Dialog,
    Button,
    DialogContent,
    Chip,
} from "@mui/material";
import { FiBell, FiCheck, FiX } from "react-icons/fi";
import OrderStatusChip from "./OrderStatusChip";
import ActivityPanelOrderItemRadioGroup from "./ActivityPanelOrderItemRadioGroup";

const ActivityPanelTableView: FC<{
    activityPanel: ActivityPanelResponse;
    refreshActivityPanel: () => Promise<unknown>;
}> = ({ activityPanel, refreshActivityPanel }) => {
    // Helper methods
    // Get the apporpriate colour for the assistance request status
    function getCardHeaderColour(item: TableActivityResponse) {
        if (item == null) {
            return "bg-white text-black";
        }

        if (item.current_session?.status == SessionStatus.AWAITING_PAYMENT) {
            return "bg-info-light text-black";
        }

        if (
            item.current_session?.assistance_requests.current?.status ==
            AssistanceRequestStatus.OPEN
        ) {
            return "bg-error-dark text-white";
        }

        if (
            item.current_session?.assistance_requests.current?.status ==
            AssistanceRequestStatus.HANDLING
        ) {
            return "bg-secondary text-white";
        }

        return "bg-white text-black";
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
        }).then(refreshActivityPanel);
    };
    const formatDateForHoursAndMinutes = (date: Date) => {
        const hrs = date.getHours();
        const mins = date.getMinutes();
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
        )}`;
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
                        className={`${getCardHeaderColour(dto)} rounded-t-sm`}
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
                    <div className={`px-4 pt-2`}>
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
                                                                        <ActivityPanelOrderItemRadioGroup
                                                                            orderItem={
                                                                                item
                                                                            }
                                                                            setOrderItemToState={(
                                                                                state
                                                                            ) => {
                                                                                return updateOrderStatus(
                                                                                    order.id,
                                                                                    item.id,
                                                                                    state
                                                                                )
                                                                                    .then(
                                                                                        refreshActivityPanel
                                                                                    )
                                                                                    .then(
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
                                                            ?.assistance_requests
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
                                                                            refreshActivityPanel
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
                    <DialogActions>
                        {dto.current_session.status ==
                            SessionStatus.AWAITING_PAYMENT && (
                            <Button
                                onClick={() => {
                                    completeSession(`Table${dto.table_number}`)
                                        .then(refreshActivityPanel)
                                        .then(closeSessionDialog);
                                }}
                            >
                                Reset Table
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            )
        );
    };

    const ordersInKitchen = () =>
        activityPanel?.tables
            .flatMap((x) => x.current_session?.orders)
            .flatMap(x => x?.items)
            .filter(
                (x) =>
                    x?.status == OrderStatus.PREPARING ||
                    x?.status == OrderStatus.ORDERED
            ).length;

    const ordersToBeDeliveredOrDelivering = () =>
        activityPanel?.tables
            .flatMap((x) => x.current_session?.orders)
            .flatMap((x) => x?.items)
            .filter(
                (x) =>
                    x?.status == OrderStatus.READY ||
                    x?.status == OrderStatus.DELIVERING
            ).length;

    const helpRequests = () =>
        activityPanel?.tables
            .map((x) => x.current_session?.assistance_requests.current)
            .filter((x) => x != null).length;

    return (
        <>
            {activityPanel == null ? (
                <>No content</>
            ) : (
                <div className="flex flex-col w-full gap-2">
                    <div className="flex gap-4">
                        <Box className="w-full text-white p-2 rounded-md text-center  bg-info-dark">
                            <p className="text-xl">{ordersInKitchen()}</p>
                            {`Orders in the kitchen`}
                        </Box>
                        <Box className="w-full text-white p-2 rounded-md text-center bg-warning-dark">
                            <p className="text-xl">
                                {ordersToBeDeliveredOrDelivering()}
                            </p>
                            {`Orders to be delivered`}
                        </Box>
                        <Box className="w-full text-white p-2 rounded-md text-center bg-error-dark">
                            <p className="text-xl">{helpRequests()}</p>
                            {`Assistance requests`}
                        </Box>
                    </div>
                    <div className="h-full w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-row gap-4">
                        {activityPanel.tables.map((table) => (
                            <Box
                                key={table.table_number}
                                className={`rounded-md text-gray-800 bg-white  ${
                                    table.current_session == null
                                        ? "brightness-75 hover:brightness-95 "
                                        : "cursor-pointer"
                                }`}
                                onClick={() => {
                                    if (table.current_session != null)
                                        onClickTableWithSession(table);
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    className={`p-4 flex justify-between   
                                        ${getCardHeaderColour(
                                            table
                                        )} rounded-t-md`}
                                >
                                    <div>{`Table ${table.table_number}`}</div>
                                    <div className="flex items-center ">
                                        {table.current_session
                                            ?.assistance_requests.current && (
                                            <FiBell className={`text-2xl`} />
                                        )}
                                        {table.current_session?.status ==
                                            SessionStatus.AWAITING_PAYMENT && (
                                            <FiCheck className={`text-2xl`} />
                                        )}
                                    </div>
                                </Typography>
                                {table.current_session != null ? (
                                    <Box className="flex flex-col py-2">
                                        <div className="text-black px-4">
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
                                        {table.current_session.orders.length >
                                            0 && (
                                            <div className="px-4 py-2 flex flex-col gap-2 text-black">
                                                {"Orders: "}
                                                <div className="flex flex-col gap-3 divide-y-2 divide-gray-300">
                                                    {table.current_session.orders.map(
                                                        (order, index) => (
                                                            <div
                                                                key={order.id}
                                                                className="p-2"
                                                            >
                                                                <label className="text-sm">{`Order ${
                                                                    index + 1
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
                                                                                    <OrderStatusChip
                                                                                        status={
                                                                                            item.status
                                                                                        }
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
            <SessionDialog
                showDialog={showDialog}
                onClose={closeSessionDialog}
                dto={lastClickedTable!}
            />
        </>
    );
};

export default ActivityPanelTableView;
