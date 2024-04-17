// Menu page for customers
import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    CardActions,
    CardContent,
} from "@mui/material";
import { MenuItem } from "../utils/menu";
import { getMenuItems } from "../utils/api";
import ManagerMenuEditItemDialog from "../components/ManagerItemsEditItemDialog";
import ManagerMenuCreateItemDialog from "../components/ManagerItemsCreateItemDialog";
import ManagerBottomBar from "../components/ManagerBottomBar";
import currencyFormatter from "../utils/currencyFormatter";

const ManagerItems = () => {
    // MAIN PAGE
    const [menuItems, setMenuItems] = useState<MenuItem[] | null>([]);
    async function fetchItems() {
        const fetchedMenu = await getMenuItems();
        setMenuItems(fetchedMenu);
    }

    // On mounted
    useEffect(() => {
        fetchItems().catch((err) => console.log("Failed to fetch menu", err));
    }, []);

    // Create Category Dialog controls
    const [showCreateItemDialog, setShowCreateItemDialog] =
        useState<boolean>(false);
    const handleShowCreateItemDialog = () => {
        setShowCreateItemDialog(true);
    };
    const handleNewItemCreated = async () => {
        setShowCreateItemDialog(false);
        await fetchItems();
    };

    // Edit category Dialog Controls
    const [showEditCategoryDialog, setShowEditItemDialog] =
        useState<boolean>(false);
    const [lastClickedCategoryForEdit, setLastClickedItemForEdit] =
        useState<MenuItem | null>(null);
    const handleShowEditItemDialog = (menuItem: MenuItem) => {
        setLastClickedItemForEdit(menuItem);
        setShowEditItemDialog(true);
    };
    const handleItemsChanged = async () => {
        setShowEditItemDialog(false);
        await fetchItems();
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "center",
                bgcolor: "#121212",
                paddingTop: "20px",
                color: "#E0E0E0",
                background: `linear-gradient(to bottom right, #121212, #2C2C2C)`,
            }}
        >
            <Typography variant="h4" gutterBottom sx={{ color: "#FFF" }}>
                Menu Dashboard
            </Typography>
            <Container
                sx={{
                    width: "100%",
                    paddingX: "1.5em",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5em",
                }}
            >
                <div className="grid grid-cols-3 py-1">
                    <div>
                        <Button
                            sx={{
                                background: "white",
                            }}
                            onClick={handleShowCreateItemDialog}
                        >
                            Create Menu Item
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        <Typography variant="h5">Menu Items</Typography>
                    </div>
                    <div className="flex justify-end"></div>
                </div>
                {menuItems?.map((menuItem, index) => (
                    <Card
                        key={index}
                        sx={{
                            bgcolor: "white",
                            display: "flex",
                        }}
                    >
                        <CardContent
                            sx={{
                                flex: "1",
                            }}
                        >
                            <ol className="grid grid-cols-5 gap-2 w-full">
                                <li>{menuItem.name}</li>
                                <li className="truncate">
                                    {currencyFormatter.format(menuItem.price)}
                                </li>
                                <li className="truncate">
                                    {menuItem.description}
                                </li>
                                <li className="truncate">
                                    {menuItem.ingredients.join(", ")}
                                </li>
                                <li className="truncate">
                                    {menuItem.health_requirements.join(", ")}
                                </li>
                            </ol>
                        </CardContent>
                        <CardActions className="grid grid-cols-3">
                            <Button
                                sx={{
                                    gridColumnStart: 3,
                                }}
                                size="small"
                                color="secondary"
                                onClick={() =>
                                    handleShowEditItemDialog(menuItem)
                                }
                            >
                                Edit
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Container>
            <ManagerMenuEditItemDialog
                showDialog={showEditCategoryDialog}
                onClose={() => setShowEditItemDialog(false)}
                menuItem={lastClickedCategoryForEdit!}
                onEditMenuItem={handleItemsChanged}
                onDeleteMenuItem={handleItemsChanged}
            />
            <ManagerMenuCreateItemDialog
                showDialog={showCreateItemDialog}
                onClose={() => setShowCreateItemDialog(false)}
                onCreateMenuItem={handleNewItemCreated}
            />
            <ManagerBottomBar currentPageName={"ItemManagement"} />
        </Box>
    );
};

export default ManagerItems;
