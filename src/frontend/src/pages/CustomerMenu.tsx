// Menu page for customers
import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Drawer,
    Typography,
    styled,
    InputBase,
    AppBar,
    Toolbar,
    Card,
    CardHeader,
    CardContent,
    Checkbox,
    FormControlLabel,
    Popover,
    Snackbar,
    SnackbarContent,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CardMedia,
} from "@mui/material";
import { Send, OutdoorGrill, RoomService } from "@mui/icons-material";
import { DietaryDetail, Menu, MenuItem } from "../utils/menu";
import {
    MakeOrder,
    SessionResponse,
    getSession,
    getMenu,
    createAssistanceRequest,
    tabletResolveAssistanceRequest,
    CreateOrderItemRequest,
    OrderStatus,
    lockSession,
} from "../utils/api";
import {
    AssistanceRequestUpdatedEventName,
    NotificationSocket,
} from "../utils/socketIo";
import Typewriter from "typewriter-effect";
import './CustomerMenu.css';

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
});

const CustomerMenu = () => {
    const navigate = useNavigate();

    const [appBarHeight, setAppBarHeight] = useState(64); // Initial height of the app bar

    useEffect(() => {
        // Function to update the appBarHeight state with the actual height of the app bar
        const updateAppBarHeight = () => {
            const appBar = document.getElementById("app-bar");
            if (appBar) {
                const height = appBar.offsetHeight; // Get the height of the app bar
                setAppBarHeight(height); // Update the appBarHeight state
            }
        };

        // Call the updateAppBarHeight function when the window is resized
        window.addEventListener("resize", updateAppBarHeight);

        // Initial call to updateAppBarHeight when the component mounts
        updateAppBarHeight();

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener("resize", updateAppBarHeight);
        };
    }, []);

    // menu object initialised with empty array for categories
    const [menu, setMenu] = useState<Menu | null>({ categories: [] });

    // menu items initialised as empty objectt
    const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});

    async function fetchMenu() {
        // fetches menu data and stores in fetched menu
        const fetchedMenu = await getMenu();
        setMenu(fetchedMenu.Menu);
        setMenuItems(fetchedMenu.Items);
    }

    // Fetching Customer's Session.
    const [session, setSession] = useState<SessionResponse>();

    async function fetchTableSession(): Promise<SessionResponse> {
        return await getSession().then((s) => {
            setSession(s);
            return s;
        });
    }

    useEffect(() => {
        async function fetch() {
            const session = await fetchTableSession();
            await fetchMenu();

            if (!NotificationSocket.connected) {
                NotificationSocket.connect();
            }

            NotificationSocket.on(
                AssistanceRequestUpdatedEventName,
                async (data) => {
                    if (data.id == session?.id) {
                        await fetchTableSession();
                    }
                }
            );
        }

        fetch();

        return () => {
            NotificationSocket.removeListener(
                AssistanceRequestUpdatedEventName
            );
        };
    }, []);

    const Search = styled("div")(() => ({
        display: "flex",
        alignItems: "center",
        position: "relative",
        borderRadius: 5,
        height: "40px",
        width: "100%",
        background: "radial-gradient(circle, #545156, #6f6d71 )",
        paddingLeft: "20px",
    }));

    const StyledInputBase = styled(InputBase)(() => ({
        color: "#38353A",
        width: "100%",
        "& .MuiInputBase-input": {},
    }));

    const TypeButton = ({
        children,
        ...props
    }: {
        children: React.ReactNode;
        onClick?: () => void;
    }) => {
        return (
            <Button
                variant="outlined"
                style={{
                    color: "#F0F0F0",
                    borderRadius: 3,
                    height: "30px",
                    minWidth: "200px",
                    borderColor: "#38353A",
                    borderWidth: "1.5px",
                    paddingInline: "15px",
                    textAlign: "center",
                }}
                {...props}
            >
                {children}
            </Button>
        );
    };

    // Call Staff Section.
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const clickCallStaff = async () => {
        if (session?.assistance_requests.current) {
            // There is a current assistance request
            await tabletResolveAssistanceRequest().then((resp) =>
                setSession(resp)
            );
            return;
        }

        // There is no current assistance request.
        await createAssistanceRequest().then((resp) => {
            setSession(resp);
            return setSnackbarOpen(true);
        });
    };

    const handleClose = (
        event: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleCancel = async () => {
        await tabletResolveAssistanceRequest().then((resp) => setSession(resp));
        setSnackbarOpen(false);
    };

    const action = (
        <React.Fragment>
            <Button style={{ color: "red" }} onClick={handleCancel}>
                Cancel
            </Button>
            <Button style={{ color: "green" }} onClick={handleClose}>
                Ok
            </Button>
        </React.Fragment>
    );

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const open = Boolean(anchorEl);
    const id = open ? "filter-popover" : undefined;
    const dietaryRequirements = Object.values(DietaryDetail);

    const initialFilterOptions: { [key: string]: boolean } =
        dietaryRequirements.reduce((options, requirement) => {
            return { ...options, [requirement]: false };
        }, {});

    const [filterOptions, setFilterOptions] = useState(initialFilterOptions);

    const openFilters = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeFilters = () => {
        setAnchorEl(null);
    };

    const checkFilter = (
        event: React.ChangeEvent<HTMLInputElement>,
        option: string
    ) => {
        const isChecked = event.target.checked;
        setFilterOptions({
            ...filterOptions,
            [option]: isChecked,
        });

        if (isChecked) {
            setSelectedFilters([...selectedFilters, option]);
        } else {
            setSelectedFilters(
                selectedFilters.filter((filter) => filter !== option)
            );
        }
    };

    const clearFilters = () => {
        const updatedFilterOptions: { [key: string]: boolean } = {};
        for (const option in filterOptions) {
            updatedFilterOptions[option] = false;
        }
        setFilterOptions(updatedFilterOptions);
        setSelectedFilters([]);
    };

    const clearFilterChip = (filter: string) => {
        setFilterOptions({ ...filterOptions, [filter]: false });
        setSelectedFilters(
            selectedFilters.filter((selected) => selected !== filter)
        );
    };

    const [quantities, setQuantities] = useState<{ [itemId: string]: number }>(
        JSON.parse(localStorage.getItem("quantities") || "{}")
    );
    const [cartCounter, setCartCounter] = useState<number>(
        parseInt(localStorage.getItem("cartCounter") || "0")
    );
    const [pendingCart, setPendingCart] = useState<{
        [itemId: string]: number;
    }>(JSON.parse(localStorage.getItem("pendingCart") || "{}"));

    // Update localStorage whenever quantities, cartCounter, or pendingCart change
    useEffect(() => {
        localStorage.setItem("quantities", JSON.stringify(quantities));
    }, [quantities]);

    useEffect(() => {
        localStorage.setItem("cartCounter", cartCounter.toString());
    }, [cartCounter]);

    useEffect(() => {
        localStorage.setItem("pendingCart", JSON.stringify(pendingCart));
    }, [pendingCart]);

    const decrementQuantity = (itemId: string) => {
        const updatedQuantities = { ...quantities };
        if (updatedQuantities[itemId] && updatedQuantities[itemId] > 0) {
            updatedQuantities[itemId] -= 1;
            setQuantities(updatedQuantities);
        }
    };

    const incrementQuantity = (itemId: string) => {
        const updatedQuantities = { ...quantities };
        updatedQuantities[itemId] = (updatedQuantities[itemId] || 0) + 1;
        setQuantities(updatedQuantities);
    };

    const addToCart = (itemId: string) => {
        if (quantities[itemId] > 0) {
            const updatedQuantities = { ...quantities };
            const updatedPendingCart = { ...pendingCart };
            setCartCounter(cartCounter + updatedQuantities[itemId]);
            updatedPendingCart[itemId] =
                (updatedPendingCart[itemId] || 0) + updatedQuantities[itemId];
            updatedQuantities[itemId] = 0;
            setQuantities(updatedQuantities);
            setPendingCart(updatedPendingCart);
        }
    };

    const decrementCart = (itemId: string) => {
        const updatedPendingCart = { ...pendingCart };
        if (updatedPendingCart[itemId] && updatedPendingCart[itemId] > 0) {
            updatedPendingCart[itemId] -= 1;
            setCartCounter(cartCounter - 1);
            setPendingCart(updatedPendingCart);
        }
    };
    const incrementCart = (itemId: string) => {
        const updatedPendingCart = { ...pendingCart };
        setCartCounter(cartCounter + 1);
        updatedPendingCart[itemId] = (updatedPendingCart[itemId] || 0) + 1;
        setPendingCart(updatedPendingCart);
    };
    const setZeroCart = (itemId: string) => {
        const updatedPendingCart = { ...pendingCart };
        setCartCounter(cartCounter - updatedPendingCart[itemId]);
        updatedPendingCart[itemId] = 0;
        setPendingCart(updatedPendingCart);
    };

    const calculateTotal = () => {
        let total = 0;
        for (const itemId in pendingCart) {
            const item = menuItems[itemId];
            if (item) {
                total += pendingCart[itemId] * item.price;
            }
        }
        return total;
    };

    const [error, setError] = useState<string | null>(null);

    const sendItems = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        try {
            const itemsToSend: CreateOrderItemRequest[] = [];
            Object.entries(pendingCart).forEach(([itemId, quantity]) => {
                for (let i = 0; i < quantity; i++) {
                    const orderItem: CreateOrderItemRequest = {
                        menu_item_id: itemId,
                        is_free: false,
                        preferences: [],
                        additional_notes: "",
                    };
                    itemsToSend.push(orderItem);
                }
            });

            const response = await MakeOrder({
                session_id: session!.id!,
                items: itemsToSend,
            });

            const updatedPendingCart: { [key: string]: number } = {};
            Object.keys(pendingCart).forEach((itemId) => {
                updatedPendingCart[itemId] = 0;
            });
            setPendingCart(updatedPendingCart);
            setCartCounter(0);

            console.log("Order created successfully:", response.data);
        } catch (error) {
            console.error("Error creating order:", error);
            setError(
                "An error occurred while creating the order. Please try again."
            );
        }
    };

    const handleCloseError = () => {
        setError(null); // Close error popup
    };

    const [openBill, setOpenBill] = useState(false);

    const handleClickOpenBill = () => {
        setOpenBill(true);
    };

    const handleCloseBill = () => {
        setOpenBill(false);
    };

    const handleConfirmBill = async () => {
        try {
            await lockSession();
            navigate(`/end`);
        } catch (error) {
            console.error("Failed to lock session:", error);
        }
    };

    const [openDrawer, setOpenDrawer] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpenDrawer(newOpen);
    };

    const statusIconMap: Record<OrderStatus, JSX.Element> = {
        [OrderStatus.ORDERED]: <Send />,
        [OrderStatus.PREPARING]: <OutdoorGrill />,
        [OrderStatus.READY]: <OutdoorGrill />,
        [OrderStatus.DELIVERING]: <OutdoorGrill />,
        [OrderStatus.DELIVERED]: <RoomService />,
    };

    const DrawerList = (
        <Box
            sx={{
                width: "60vw",
                height: "100vh",
                bgcolor: "#38353A",
                paddingX: "20px",
            }}
            role="presentation"
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingY: "40px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            color: "#F0F0F0",
                            textAlign: "center",
                            marginRight: "10px",
                            fontWeight: "bold",
                        }}
                    >
                        Your Order
                    </Typography>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="#F0F0F0"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                    </svg>
                </div>
                <Button
                    onClick={toggleDrawer(false)}
                    sx={{
                        color: "#F0F0F0",
                    }}
                >
                    Close
                </Button>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "left",
                }}
            >
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        color: "#F0F0F0",
                        textAlign: "left",
                        paddingTop: "10px",
                    }}
                >
                    Current Items in Cart
                </Typography>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        backgroundColor: "transparent",
                        paddingBottom: "20px",
                    }}
                >
                    <Table aria-label="cart">
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
                                    align="left"
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    Price
                                </TableCell>
                                <TableCell
                                    align="left"
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    Quantity
                                </TableCell>
                                <TableCell
                                    align="left"
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    Subtotal
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(pendingCart).map((itemId) => {
                                const item = menuItems[itemId];
                                if (!item || pendingCart[itemId] == 0) {
                                    return null;
                                }
                                return (
                                    <TableRow
                                        key={itemId}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                { border: 0 },
                                        }}
                                    >
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            style={{
                                                fontWeight: "bold",
                                                color: "white",
                                            }}
                                        >
                                            {item.name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            style={{ color: "white" }}
                                        >
                                            {currencyFormatter.format(
                                                item.price
                                            )}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            style={{ color: "white" }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "left",
                                                }}
                                            >
                                                <Button
                                                    sx={{
                                                        minWidth: 0,
                                                        marginRight: "5px",
                                                        color: "white",
                                                        borderColor: "white",
                                                    }}
                                                    onClick={() =>
                                                        decrementCart(itemId)
                                                    }
                                                >
                                                    -
                                                </Button>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ marginX: "10px" }}
                                                >
                                                    {pendingCart[itemId]}
                                                </Typography>
                                                <Button
                                                    sx={{
                                                        minWidth: 0,
                                                        marginLeft: "5px",
                                                        color: "white",
                                                        borderColor: "white",
                                                    }}
                                                    onClick={() =>
                                                        incrementCart(itemId)
                                                    }
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    sx={{
                                                        minWidth: 0,
                                                        marginLeft: "20px",
                                                        color: "white",
                                                        borderColor: "white",
                                                        fontSize: "small",
                                                        textTransform: "none",
                                                        textDecoration:
                                                            "underline",
                                                    }}
                                                    onClick={() =>
                                                        setZeroCart(itemId)
                                                    }
                                                >
                                                    remove
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            style={{ color: "white" }}
                                        >
                                            {currencyFormatter.format(
                                                pendingCart[itemId] * item.price
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            color: "#F0F0F0",
                            marginBottom: "20px",
                        }}
                    >
                        Cart Total:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {currencyFormatter.format(calculateTotal())}
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 0.5,
                            borderColor: "#F0F0F0",
                            color: "#F0F0F0",
                            fontSize: "medium",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                borderColor: "#F0F0F0",
                            },
                        }}
                        onClick={sendItems}
                    >
                        Send Items
                    </Button>
                    {error && (
                        <div className="error-popup">
                            <p style={{ color: "red", paddingTop: "10px" }}>
                                {error}
                            </p>
                            <button
                                style={{ color: "red", paddingTop: "10px" }}
                                onClick={handleCloseError}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "left",
                }}
            >
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        color: "#F0F0F0",
                        textAlign: "left",
                        paddingTop: "40px",
                    }}
                >
                    Ordered Items
                </Typography>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        backgroundColor: "transparent",
                        paddingBottom: "20px",
                    }}
                >
                    <Table aria-label="ordered_items">
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
                                    align="left"
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    Price
                                </TableCell>
                                {/* <TableCell align="right" style={{ fontWeight: 'bold', color: 'white' }}>Quantity</TableCell>
                                <TableCell align="right" style={{ fontWeight: 'bold', color: 'white' }}>Subtotal</TableCell> */}
                                <TableCell
                                    style={{
                                        fontWeight: "bold",
                                        color: "white",
                                    }}
                                >
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {session?.orders.map((order) =>
                                order.items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                { border: 0 },
                                        }}
                                    >
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            style={{
                                                fontWeight: "bold",
                                                color: "white",
                                            }}
                                        >
                                            {item.menu_item_name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            style={{
                                                color: "white",
                                            }}
                                        >
                                            {currencyFormatter.format(
                                                menuItems[item.menu_item_id]
                                                    ?.price
                                            )}
                                        </TableCell>
                                        {/* quantity? */}
                                        <TableCell style={{ color: "white" }}>
                                            <span
                                                style={{ paddingRight: "15px" }}
                                            >
                                                {statusIconMap[item.status]}
                                            </span>
                                            {OrderStatus[item.status]}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                    }}
                >
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            color: "#F0F0F0",
                            marginBottom: "20px",
                        }}
                    >
                        Total:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {currencyFormatter.format(
                            session?.orders.reduce((total, order) => {
                                return (
                                    total +
                                    order.items.reduce((subtotal, item) => {
                                        return (
                                            subtotal +
                                            menuItems[item.menu_item_id]?.price
                                        );
                                    }, 0)
                                );
                            }, 0) ?? 0
                        )}
                    </Typography>
                </div>
            </Box>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "40px",
                }}
            >
                <Button
                    sx={{
                        borderRadius: 0.5,
                        backgroundColor: "#F0F0F0",
                        color: "black",
                        fontSize: "large",
                        paddingX: "30px",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                        },
                    }}
                    onClick={handleClickOpenBill}
                >
                    Request Bill
                </Button>
                <Dialog
                    open={openBill}
                    onClose={handleCloseBill}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Are you sure?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You will not be able to access the menu and cannot
                            order more items once you request for the bill
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseBill} sx={{ color: "red" }}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmBill} autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: "#38353A", height: "100vh" }}>
            <AppBar
                id="app-bar"
                position="fixed"
                elevation={1}
                style={{
                    WebkitAlignContent: "center",
                    background: "#38353A",
                    minHeight: "60px",
                }}
            >
                <Toolbar
                    sx={{
                        padding: "30px",
                    }}
                >
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            color: "#F0F0F0",
                            fontWeight: "bold",
                        }}
                    >
                        <Typewriter
                            options={{
                                strings: [
                                    "Welcome To The Menu.",
                                    "Discover Our Selection.",
                                    "Treat Yourself To Something Special.",
                                    "Savor The Deliciousness.",
                                ],
                                autoStart: true,
                                loop: true,
                                deleteSpeed: 80,
                            }}
                        />
                    </Typography>

                    <Button
                        key={
                            session?.assistance_requests.current?.start_time ??
                            "NONE"
                        }
                        variant="contained"
                        disableElevation
                        style={{
                            borderRadius: 3,
                            fontSize: "medium",
                            borderColor: "#38353A",
                            borderWidth: "1.5px",
                            paddingInline: "15px",
                            marginInline: "20px",
                        }}
                        color={
                            session?.assistance_requests.current != null
                                ? "success"
                                : "primary"
                        }
                        onClick={clickCallStaff}
                    >
                        {session?.assistance_requests.current == null
                            ? "Call Staff"
                            : "Staff Called"}
                    </Button>
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleClose}
                        message="Staff has been called"
                        action={action}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <SnackbarContent
                            sx={{
                                height: "70px",
                                borderRadius: "3px",
                                backgroundColor: "#F0F0F0",
                                color: "#38353A",
                                paddingX: "30px",
                            }}
                            message={
                                <Typography variant="h6" paddingRight="40px">
                                    Staff has been called
                                </Typography>
                            }
                            action={action}
                        />
                    </Snackbar>
                    <Button
                        variant="outlined"
                        sx={{
                            borderRadius: 0.5,
                            borderColor: "transparent",
                            color: "#F0F0F0",
                            fontSize: "medium",
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                borderColor: "#F0F0F0",
                            },
                        }}
                        onClick={toggleDrawer(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#F0F0F0"
                            className="w-6 h-6"
                            style={{ marginRight: "5px" }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                        </svg>
                        Cart ({cartCounter})
                    </Button>
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)}>
                        {DrawerList}
                    </Drawer>
                </Toolbar>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginInline: "20px",
                        marginBottom: "10px",
                    }}
                >
                    <Search>
                        {selectedFilters.length === 0 && (
                            <StyledInputBase
                                placeholder="e.g. Vegetarian, Spicy"
                                inputProps={{ "aria-label": "search" }}
                                sx={{ color: "white" }}
                            />
                        )}
                        {selectedFilters.map((filter) => (
                            <Chip
                                key={filter}
                                label={filter}
                                onDelete={() => clearFilterChip(filter)}
                                style={{
                                    marginInline: "5px",
                                    backgroundColor: "#F0F0F0",
                                    height: "25px",
                                }}
                            />
                        ))}
                        {selectedFilters.length > 0 && (
                            <Button
                                onClick={clearFilters}
                                sx={{
                                    color: "#F0F0F0",
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Search>
                    <Button
                        variant="outlined"
                        style={{
                            borderRadius: 5,
                            height: "40px",
                            borderColor: "#F0F0F0",
                            borderWidth: "1.5px",
                            marginLeft: "20px",
                        }}
                        onClick={openFilters}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="#F0F0F0"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                            />
                        </svg>
                    </Button>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={closeFilters}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                    >
                        <Box sx={{ padding: "20px" }}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold" }}
                            >
                                Filter Options
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    width: "500px",
                                }}
                            >
                                {Object.keys(filterOptions).map((option) => (
                                    <FormControlLabel
                                        key={option}
                                        control={
                                            <Checkbox
                                                checked={filterOptions[option]}
                                                onChange={(event) =>
                                                    checkFilter(event, option)
                                                }
                                            />
                                        }
                                        label={option}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Popover>
                </Box>
                <Box
                    sx={{
                        maxWidth: "100%",
                        paddingX: "20px",
                        paddingBottom: "5px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        justifyContent: "space-evenly",
                    }}
                >
                    {menu?.categories.map((category) => (
                        // Add anchor links to category buttons
                        <a
                            key={category.name}
                            href={`#${category.name}`}
                            style={{ textDecoration: "none" }}
                        >
                            <TypeButton>{category.name}</TypeButton>
                        </a>
                    ))}
                </Box>
            </AppBar>
            <Box
                sx={{
                    marginTop: `calc(${appBarHeight}px)`,
                    paddingX: "20px",
                    height: "100%",
                }}
            >
                {menu?.categories.map((category) => (
                    <React.Fragment key={category.name}>
                      <span className="anchor-offset" style={{ top: `-${appBarHeight}px` }} id={category.name}></span>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: "bold",
                                color: "#F0F0F0",
                                paddingY: "15px",
                            }}
                        >
                            {category.name}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                columnGap: "10px",
                                rowGap: "15px",
                            }}
                        >
                            {category.menu_items.map((itemId) => {
                                const item = menuItems[itemId];
                                const matchesFilters = selectedFilters.every(
                                    (filter) =>
                                        item.health_requirements.includes(
                                            filter
                                        )
                                );
                                if (
                                    matchesFilters ||
                                    selectedFilters.length === 0
                                ) {
                                    return (
                                        <Card key={itemId} sx={{ width: 300 }}>
                                            <CardHeader title={item?.name} />
                                            {item?.photo_url && (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={item.photo_url}
                                                    sx={{ height: "200px" }}
                                                />
                                            )}
                                            <CardContent>
                                                <Typography
                                                    variant="body1"
                                                    height="50px"
                                                    sx={{ overflowY: "auto" }}
                                                >
                                                    {item?.description}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                        marginTop: "10px",
                                                    }}
                                                >
                                                    <Box>
                                                        {item?.health_requirements.map(
                                                            (detail) => (
                                                                <Chip
                                                                    size="small"
                                                                    sx={{
                                                                        marginRight:
                                                                            "5px",
                                                                    }}
                                                                    label={
                                                                        detail
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Box>
                                                    <Typography>
                                                        {currencyFormatter.format(
                                                            item?.price
                                                        )}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                        marginTop: "10px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            flexDirection:
                                                                "row",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                decrementQuantity(
                                                                    itemId
                                                                )
                                                            }
                                                            sx={{
                                                                minWidth: 0,
                                                                marginRight:
                                                                    "5px",
                                                                color: "#38353A",
                                                                borderColor:
                                                                    "white",
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0 , 0.1)",
                                                                    borderColor:
                                                                        "#F0F0F0",
                                                                },
                                                            }}
                                                        >
                                                            -
                                                        </Button>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                paddingX:
                                                                    "10px",
                                                            }}
                                                        >
                                                            {quantities[
                                                                itemId
                                                            ] || 0}
                                                        </Typography>
                                                        <Button
                                                            onClick={() =>
                                                                incrementQuantity(
                                                                    itemId
                                                                )
                                                            }
                                                            sx={{
                                                                minWidth: 0,
                                                                marginLeft:
                                                                    "5px",
                                                                color: "#38353A",
                                                                borderColor:
                                                                    "white",
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "rgba(0, 0, 0 , 0.1)",
                                                                    borderColor:
                                                                        "#F0F0F0",
                                                                },
                                                            }}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor:
                                                                "transparent",
                                                            color: "#38353A",
                                                            borderRadius: "1",
                                                            backgroundColor:
                                                                "rgba(0, 0, 0 , 0.1)",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "rgba(255, 255, 255, 1)",
                                                                borderColor:
                                                                    "#38353A",
                                                            },
                                                        }}
                                                        onClick={() =>
                                                            addToCart(itemId)
                                                        }
                                                    >
                                                        Add To Cart
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                }
                            })}
                        </Box>
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

export default CustomerMenu;
