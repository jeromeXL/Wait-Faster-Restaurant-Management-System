import { FC } from "react";
import {
    ActivityPanelResponse,
    OrderItemResponse,
    OrderStatus,
    updateOrderStatus,
} from "../../utils/api";
import { Box, Typography } from "@mui/material";
import OrderStatusChip from "./OrderStatusChip";
import ActivityPanelOrderItemRadioGroup from "./ActivityPanelOrderItemRadioGroup";


type EnrichedOrderItem = OrderItemResponse & {orderId: string, tableNumber: number}
const ActivityPanelOrderView: FC<{
    activityPanel: ActivityPanelResponse;
    refreshActivityPanel: () => Promise<unknown>;
}> = ({ activityPanel, refreshActivityPanel }) => {

    const formatDateForHoursAndMinutes = (item: EnrichedOrderItem) => {
        
        const date = new Date()
        date.setUTCMilliseconds(item.last_updated * 1000)
        const hrs = date.getHours();
        const mins = date.getMinutes();
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
        )}`;
    };

    // Extract all order items from the activity panel, order by last updated.
    function divideOrdersByActionability(): [
        EnrichedOrderItem[],
        EnrichedOrderItem[],
        EnrichedOrderItem[]
    ] {
        const orderItems = activityPanel.tables
            .filter((x) => x.current_session != null)
            .map(table => table.current_session!.orders.map(order => ({...order, tableNumber: table.table_number})))
            .flatMap(tables => tables)
            .map(x => x.items.map(item => ({...item, orderId: x.id, tableNumber: x.tableNumber})))
            .flatMap(items => items)
            .sort((a, b) =>
                (a?.last_updated ?? 0) < (b?.last_updated ?? 0) ? -1 : 1
            );

        const actionableItems = orderItems.filter(
            (x) => x?.status == OrderStatus.READY
        );
        const deliveringItems = orderItems.filter(
            (x) => x?.status == OrderStatus.DELIVERING
        );
        const kitchenItems = orderItems.filter(
            (x) =>
                x?.status == OrderStatus.ORDERED ||
                x?.status == OrderStatus.PREPARING
        );


        return [actionableItems, deliveringItems, kitchenItems];
    }

    const [actionableItems, deliveringItems, kitchenItems] =
        divideOrdersByActionability();
    
    const ItemDisplay: FC<{ item: EnrichedOrderItem }> = ({ item }) => {
        return (
            <Box className="bg-white text-black rounded-md p-1 flex">
                <Typography variant="subtitle1" className="flex justify-center">
                    {`Table${item.tableNumber} - ${item.menu_item_name} - ${formatDateForHoursAndMinutes(item)}`}
                </Typography>
                <div className="flex flex-1 justify-end">
                    {item.status == OrderStatus.READY ||
                    item.status == OrderStatus.DELIVERING ? (
                        <ActivityPanelOrderItemRadioGroup
                            orderItem={item}
                            setOrderItemToState={(status) =>
                                updateOrderStatus(
                                    item.orderId,
                                    item.id,
                                    status
                                ).then(refreshActivityPanel)
                            }
                        />
                    ) : (
                        <OrderStatusChip status={item.status} />
                    )}
                </div>
            </Box>
        );
    };


    return (
        <>
            <section className="flex flex-col divide-y-2 divide-gray-300">
                <div className="py-2">
                    <Typography
                        variant="h5"
                        className="w-full flex justify-center py-1"
                    >
                        Actionable
                    </Typography>
                    <div className="flex flex-col gap-2">
                        {actionableItems.map((item) => (
                            <ItemDisplay item={item} />
                        ))}
                    </div>
                </div>
                <div className="py-2">
                    <Typography
                        variant="h5"
                        className="w-full flex justify-center py-1"
                    >
                        Delivering
                    </Typography>
                    <div className="flex flex-col gap-2">
                        {deliveringItems.map((item) => (
                            <ItemDisplay item={item} />
                        ))}
                    </div>
                </div>
                <div className="py-2">
                    <Typography
                        variant="h5"
                        className="w-full flex justify-center py-1"
                    >
                        In Kitchen
                    </Typography>
                    <div className="flex flex-col gap-2">
                        {kitchenItems.map((item) => (
                            <ItemDisplay item={item} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
    
};

export default ActivityPanelOrderView;
