import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { OrderStatus, SessionResponse, getMenu, getSession } from "../utils/api";
import { MenuItem } from "../utils/menu";
import {
    NotificationSocket,
    SessionCompletedEventName,
} from "../utils/socketIo";
import currencyFormatter from "../utils/currencyFormatter";
import { useNavigate } from "react-router-dom";

const EndPage = () => {
    const [session, setSession] = useState<SessionResponse>();
    const [itemsWithCount, setItemsWithCount] = useState<
        { item: MenuItem; count: number }[]
    >([]);
    const [total, setTotal] = useState<number>(0);
    const navigate = useNavigate();

    async function fetchTableSession(): Promise<SessionResponse> {
        const _session = await getSession();
        setSession(_session);
        console.log("Set session to", _session);
        return _session;
    }

    async function fetchMenu(): Promise<Record<string, MenuItem>> {
        // fetches menu data and stores in fetched menu
        const fetchedMenu = await getMenu();
        return fetchedMenu.Items;
    }

    useEffect(() => {
        const fetchData = async () => {
            const _session = await fetchTableSession();
            if (_session == null) {
                navigate("/start");
            }
            const _items = await fetchMenu();

            if (!NotificationSocket.connected) {
                NotificationSocket.connect();
            }

            NotificationSocket.on(
                SessionCompletedEventName,
                async (data: { session_id: string }) => {
                    console.log(data, _session);
                    if (data.session_id == _session?.id) {
                        navigate("/start");
                    }
                }
            );

            const _itemsWithCount = _session
                ? getOrderItemCounts(_session, _items)
                : [];

            setItemsWithCount(_itemsWithCount);
            setTotal(
                _itemsWithCount.reduce((acc, itemWithCount) => {
                    const itemTotal =
                        itemWithCount.item.price * itemWithCount.count;
                    return acc + itemTotal;
                }, 0)
            );
        };

        fetchData();

        return () => {
            NotificationSocket.removeListener(SessionCompletedEventName);
        };
    }, []);

    // get aggregate list of ordered items and quantity ordered
    const getOrderItemCounts = (
        session: SessionResponse,
        menuItems: Record<string, MenuItem>
    ) => {
        const itemCounts = new Map();

        // Iterate over each order in the session
        session.orders.forEach((order) => {
            // Iterate over each item in the order
            order.items.forEach((item) => {
                // Check if the item is not cancelled
                if (item.status != OrderStatus.CANCELLED) {
                    // Increment count for the menu item
                    const count = itemCounts.get(item.menu_item_id) || 0;
                    itemCounts.set(item.menu_item_id, count + 1);
                }
            });
        });

        // Create an array containing items with counts
        const itemsWithCounts = Array.from(itemCounts.entries()).map(
            ([itemId, count]) => {
                // Find the item details from the menuItems using itemId
                const menuItem = menuItems[itemId];
                return {
                    item: menuItem,
                    count: count,
                };
            }
        );

        return itemsWithCounts;
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background:
                    "linear-gradient(45deg, hsla(276, 5%, 22%, 1) 0%, hsla(242, 23%, 40%, 1) 48%, hsla(255, 21%, 59%, 1) 100%)",
            }}
        >
            <Container
                sx={{
                    textAlign: "center",
                    color: "white",
                    padding: 4,
                    borderRadius: 2,
                    backdropFilter: "blur(10px)",
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Thank You for Eating with Us
                </Typography>
                <Typography variant="subtitle1">
                    We hope you had a great experience. See you again soon!
                </Typography>
            </Container>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    backgroundColor: "transparent",
                    paddingX: "200px",
                    paddingY: "20px",
                }}
            >
                <Table aria-label="bill">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{
                                    fontWeight: "bold",
                                    color: "white",
                                }}
                            >
                                Item
                            </TableCell>
                            <TableCell
                                align="right"
                                style={{
                                    fontWeight: "bold",
                                    color: "white",
                                }}
                            >
                                Price
                            </TableCell>
                            <TableCell
                                align="right"
                                style={{ fontWeight: "bold", color: "white" }}
                            >
                                Quantity
                            </TableCell>
                            <TableCell
                                align="right"
                                style={{ fontWeight: "bold", color: "white" }}
                            >
                                Subtotal
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {itemsWithCount.map((itemWithCount) => (
                            <TableRow key={itemWithCount.item.id}>
                                <TableCell
                                    component="th"
                                    scope="row"
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    {itemWithCount.item.name}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{ color: "white" }}
                                >
                                    {currencyFormatter.format(
                                        itemWithCount.item.price
                                    )}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{ color: "white" }}
                                >
                                    {itemWithCount.count}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    style={{ color: "white" }}
                                >
                                    {currencyFormatter.format(
                                        itemWithCount.count *
                                            itemWithCount.item.price
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <div style={{ color: "white", fontWeight: "bold" }}>
                Bill Total: {currencyFormatter.format(total)}
            </div>
        </Box>
    );
};

export default EndPage;
