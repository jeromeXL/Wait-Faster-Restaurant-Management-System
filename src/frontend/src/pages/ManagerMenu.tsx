// Menu page for customers
import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Category, Menu, MenuItem } from "../utils/menu";
import UpArrowIcon from "../components/Icons/UpArrowIcon";
import DownArrowIcon from "../components/Icons/DownArrowIcon";
import { CategoryResponse, getMenu, reorderMenu } from "../utils/api";
import ManagerMenuCreateCategoryDialog from "../components/ManagerMenuCreateCategoryDialog";
import ManagerMenuEditCategoryDialog from "../components/ManagerMenuEditCategoryDialog";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
});

const ManagerMenu = () => {
    // Setup
    const navigate = useNavigate();
    const hanldleGoToManagerItems = () => {
        navigate("/manager");
    };

    // MAIN PAGE
    const [menu, setMenu] = useState<Menu | null>({ categories: [] });
    const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
    async function fetchMenu() {
        const fetchedMenu = await getMenu();
        setMenu(fetchedMenu.Menu);
        setMenuItems(fetchedMenu.Items);
    }

    // On mounted
    useEffect(() => {
        fetchMenu().catch((err) => console.log("Failed to fetch menu", err));
    }, []);

    // Create Category Dialog controls
    const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
        useState<boolean>(false);
    const handleShowCreateCategoryDialog = () => {
        setShowCreateCategoryDialog(true);
    };
    const handleNewCategoryCreated = async () => {
        setShowCreateCategoryDialog(false);
        await fetchMenu();
    };

    // Edit category Dialog Controls
    const [showEditCategoryDialog, setShowEditCategoryDialog] =
        useState<boolean>(false);
    const [lastClickedCategoryForEdit, setLastClickedCategoryForEidt] =
        useState<Category | null>(null);
    const handleShowEditCategoryDialog = (category: Category) => {
        setLastClickedCategoryForEidt(category);
        setShowEditCategoryDialog(true);
    };
    const handleCategoriesChanged = async () => {
        console.log("edited!");
        setShowEditCategoryDialog(false);
        await fetchMenu();
    };

    // Accordion controls
    const [expandedCategoryName, setExpandedCategoryName] = useState<
        string | undefined
    >(menu?.categories[0]?.id);

    const isLastItemInCategory = (category: Category, itemId: string) =>
        category.menu_items[category.menu_items.length - 1] == itemId;
    const isFirstItemInCategory = (category: Category, itemId: string) =>
        category.menu_items[0] == itemId;

    const isLastCategory = (id: string) =>
        menu?.categories[menu.categories.length - 1].id == id;
    const isFirstCategory = (id: string) => menu?.categories[0].id == id;

    const handleReorderCategories = async (
        categoryId: string,
        movementDirection: "Up" | "Down"
    ) => {
        // Get the categories as a list of names
        const idList = menu?.categories.map((x) => x.id);
        if (idList == null) {
            return Promise.reject("No categories to re-order.");
        }

        // Get the indexes of the two items that need to be swapped.
        const targetItemIndex = idList?.indexOf(categoryId);
        const isValidMovement =
            (movementDirection == "Down" &&
                targetItemIndex != idList.length - 1) ||
            (movementDirection == "Up" && targetItemIndex != 0);
        if (!isValidMovement) {
            return Promise.reject("Cannot move category in that direction.");
        }

        const indexToMoveTargetTo =
            targetItemIndex + (movementDirection == "Up" ? -1 : 1);

        // Swap targetItemIndex and indexToMoveTargetTo
        const temp = idList[targetItemIndex];
        idList[targetItemIndex] = idList[indexToMoveTargetTo];
        idList[indexToMoveTargetTo] = temp;

        // Make a request to update the order
        const updatedMenu = await reorderMenu({ order: idList });

        setMenu(updatedMenu.Menu);
        setMenuItems(updatedMenu.Items);
    };

    const handleReorderMenuItems = async (
        category: Category,
        itemId: string,
        movementDirection: "Up" | "Down"
    ) => {
        // Get the list of items
        const idList = category.menu_items;

        // Get the indexes of the two items that need to be swapped
        const targetItemIndex = idList.indexOf(itemId);
        const isValidMovement =
            (movementDirection == "Down" &&
                targetItemIndex != idList.length - 1) ||
            (movementDirection == "Up" && targetItemIndex != 0);
        if (!isValidMovement) {
            return Promise.reject("Cannot move item in that direction.");
        }

        const indexToMoveTargetTo =
            targetItemIndex + (movementDirection == "Up" ? -1 : 1);

        // Swap targetItemIndex and indexToMoveTargetTo
        const temp = idList[targetItemIndex];
        idList[targetItemIndex] = idList[indexToMoveTargetTo];
        idList[indexToMoveTargetTo] = temp;

        // Send an http request and re-organize the items.
        // TEMP - SORT THE CATEGORIES
        const sortedItems = [];
        for (const item of idList) {
            sortedItems.push(category.menu_items.find((x) => x == item)!);
        }

        // Update the category
        category.menu_items = idList;
        const oldCategoryIndex = menu?.categories.findIndex(
            (x) => x.id == category.id
        );
        const newMenu: Menu = {
            categories: [
                ...menu!.categories.slice(0, oldCategoryIndex),
                category,
                ...menu!.categories.slice(oldCategoryIndex! + 1),
            ],
        };
        setMenu(newMenu);
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
                }}
            >
                <div class="grid grid-cols-3 py-1">
                    <div>
                        <Button
                            sx={{
                                background: "white",
                            }}
                            onClick={handleGoToManagerItems}
                        >
                            Edit Items
                        </Button>
                    </div>
                    <div class="flex justify-center">
                        <Typography>Categories</Typography>
                    </div>
                    <div class="flex justify-end">
                        <Button
                            sx={{
                                background: "white",
                            }}
                            onClick={handleShowCreateCategoryDialog}
                        >
                            Create
                        </Button>
                    </div>
                </div>
                {menu.categories.map((category, index) => (
                    <Accordion
                        key={index}
                        sx={{
                            bgcolor: "white",
                        }}
                        expanded={category.id == expandedCategoryName}
                        onChange={() => setExpandedCategoryName(category.id)}
                    >
                        <AccordionSummary>
                            <div class="flex flex-row w-full">
                                <Typography
                                    sx={{
                                        flex: "1",
                                    }}
                                >
                                    {category.name}
                                </Typography>
                                <div class="grid grid-cols-3">
                                    {isFirstCategory(category.id) ? null : (
                                        <Button
                                            sx={{
                                                gridColumnStart: 1,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                return handleReorderCategories(
                                                    category.id,
                                                    "Up"
                                                );
                                            }}
                                        >
                                            <UpArrowIcon />
                                        </Button>
                                    )}
                                    {isLastCategory(category.id) ? null : (
                                        <Button
                                            sx={{
                                                gridColumnStart: 2,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                return handleReorderCategories(
                                                    category.id,
                                                    "Down"
                                                );
                                            }}
                                        >
                                            <DownArrowIcon />
                                        </Button>
                                    )}
                                    <Button
                                        sx={{
                                            gridColumnStart: 3,
                                        }}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowEditCategoryDialog(
                                                category
                                            );
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </AccordionSummary>

                        <AccordionDetails
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5em",
                            }}
                        >
                            {category.menu_items.map((item) => (
                                <Card
                                    key={item}
                                    sx={{
                                        display: "flex",
                                        gap: "1.5em",
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            flex: "1",
                                        }}
                                    >
                                        <ol class="grid grid-cols-4 gap-2">
                                            <li>{menuItems[item].name}</li>
                                            <li>
                                                {currencyFormatter.format(
                                                    menuItems[item].price
                                                )}
                                            </li>
                                            <li>
                                                {menuItems[item].description}
                                            </li>
                                            <li>
                                                {menuItems[
                                                    item
                                                ].health_requirements.join(
                                                    ", "
                                                )}
                                            </li>
                                        </ol>
                                    </CardContent>
                                    <CardActions class="grid grid-cols-3">
                                        {isFirstItemInCategory(
                                            category,
                                            item
                                        ) ? null : (
                                            <Button
                                                color="secondary"
                                                sx={{
                                                    gridColumnStart: 1,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    return handleReorderMenuItems(
                                                        category,
                                                        item,
                                                        "Up"
                                                    );
                                                }}
                                            >
                                                <UpArrowIcon />
                                            </Button>
                                        )}
                                        {isLastItemInCategory(
                                            category,
                                            item
                                        ) ? null : (
                                            <Button
                                                color="secondary"
                                                sx={{
                                                    gridColumnStart: 2,
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    return handleReorderMenuItems(
                                                        category,
                                                        item,
                                                        "Down"
                                                    );
                                                }}
                                            >
                                                <DownArrowIcon />
                                            </Button>
                                        )}
                                        <Button
                                            sx={{
                                                gridColumnStart: 3,
                                            }}
                                            size="small"
                                            color="secondary"
                                        >
                                            Edit
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
            <ManagerMenuEditCategoryDialog
                showDialog={showEditCategoryDialog}
                onClose={() => setShowEditCategoryDialog(false)}
                category={lastClickedCategoryForEdit!}
                onEditCategory={handleCategoriesChanged}
                onDeleteCategory={handleCategoriesChanged}
            />
            <ManagerMenuCreateCategoryDialog
                showDialog={showCreateCategoryDialog}
                onClose={() => setShowCreateCategoryDialog(false)}
                onCreateCategory={handleNewCategoryCreated}
            />
        </Box>
    );
};

export default ManagerMenu;
