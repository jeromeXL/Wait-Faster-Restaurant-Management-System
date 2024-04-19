import { FormControl } from "@mui/base";
import { OrderItemResponse, OrderStatus } from "../../utils/api";
import { Chip } from "@mui/material";
import OrderStatusChip from "./OrderStatusChip";

const ActivityPanelOrderItemRadioGroup = ({
    orderItem,
    setOrderItemToState,
}: {
    orderItem: OrderItemResponse;
    setOrderItemToState: (state: OrderStatus) => Promise<unknown>;
}) => {
    const can_modify_current_order_status =
        orderItem.status != OrderStatus.DELIVERED &&
        orderItem.status != OrderStatus.CANCELLED;

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
                                    setOrderItemToState(OrderStatus.PREPARING)
                                }
                            />
                            <Chip
                                label="CANCELLED"
                                sx={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setOrderItemToState(OrderStatus.CANCELLED)
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
                            <Chip
                                label="CANCELLED"
                                sx={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setOrderItemToState(OrderStatus.CANCELLED)
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
                                    setOrderItemToState(OrderStatus.PREPARING)
                                }
                            />
                            <Chip label="READY" color="warning" />
                            <Chip
                                label="DELIVERING"
                                sx={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setOrderItemToState(OrderStatus.DELIVERING)
                                }
                            />
                            <Chip
                                label="CANCELLED"
                                sx={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setOrderItemToState(OrderStatus.CANCELLED)
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
                                    setOrderItemToState(OrderStatus.DELIVERED)
                                }
                            />
                            <Chip
                                label="CANCELLED"
                                sx={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    setOrderItemToState(OrderStatus.CANCELLED)
                                }
                            />
                        </div>
                    )}
                </FormControl>
            )}
            {!can_modify_current_order_status && (
                <OrderStatusChip status={orderItem.status} />
            )}
        </div>
    );
};

export default ActivityPanelOrderItemRadioGroup