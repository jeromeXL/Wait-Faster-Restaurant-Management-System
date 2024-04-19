import { Chip } from "@mui/material";
import { OrderStatus } from "../../utils/api";

const OrderStatusChip = ({ status }: { status: OrderStatus }) => {
    return (
        <>
            {status == OrderStatus.ORDERED && (
                <Chip label="ORDERED" color="info" />
            )}
            {status == OrderStatus.PREPARING && (
                <Chip label="PREPARING" color="error" />
            )}
            {status == OrderStatus.READY && (
                <Chip label="READY" color="warning" />
            )}
            {status == OrderStatus.DELIVERING && (
                <Chip label="DELIVERING" color="secondary" />
            )}
            {status == OrderStatus.DELIVERED && (
                <Chip label="DELIVERED" color="success" />
            )}
            {status == OrderStatus.CANCELLED && (
                <Chip label="CANCELLED" color="error" variant="outlined" />
            )}
        </>
    );
};

export default OrderStatusChip