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
import {
    CategoryResponse,
    getMenu,
    getMenuItems,
    reorderMenu,
    updateCategory,
} from "../utils/api";
import ManagerMenuCreateCategoryDialog from "../components/ManagerMenuCreateCategoryDialog";
import ManagerMenuEditCategoryDialog from "../components/ManagerMenuEditCategoryDialog";
import ManagerBottomBar from "../components/ManagerBottomBar";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
});

const ManagerMenu = () => {
    // MAIN PAGE
    const [menu, setMenu] = useState<Menu | null>({ categories: [] });
    const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
    async function fetchMenu() {
        const fetchedMenu = await getMenu();
        setMenu(fetchedMenu.Menu);

        const allMenuItems = await getMenuItems();
        const map: Record<string, MenuItem> = {};
        for (const menuItem of allMenuItems) {
            map[menuItem.id] = menuItem;
        }
        setMenuItems(map);
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
    const handleCategoriesChanged = async (
        resp: CategoryResponse | undefined = undefined
    ) => {
        setShowEditCategoryDialog(false);
        setExpandedCategoryId(resp?.id);
        await fetchMenu();
    };

    // Accordion controls
    const [expandedCategoryName, setExpandedCategoryId] = useState<
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

        await updateCategory(category.id, {
            menu_items: idList,
            name: category.name,
        });

        const fetchedMenu = await getMenu();
        setMenu(fetchedMenu.Menu);
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
                <div className="grid grid-cols-3 py-1">
                    <div>
                        <Button
                            sx={{
                                background: "white",
                            }}
                            onClick={handleShowCreateCategoryDialog}
                        >
                            Create Category
                        </Button>
                    </div>
                    <div className="flex justify-center">
                        <Typography variant="h5">Categories</Typography>
                    </div>
                    <div className="flex justify-end"></div>
                </div>
                {menu?.categories.map((category, index) => (
                    <Accordion
                        key={index}
                        sx={{
                            bgcolor: "white",
                        }}
                        expanded={category.id == expandedCategoryName}
                        onChange={() => setExpandedCategoryId(category.id)}
                    >
                        <AccordionSummary>
                            <div className="flex flex-row w-full">
                                <Typography
                                    sx={{
                                        flex: "1",
                                    }}
                                >
                                    {category.name}
                                </Typography>
                                <div className="grid grid-cols-3">
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
                                        <ol className="grid grid-cols-4 gap-2">
                                            <li>{menuItems[item]?.name}</li>
                                            <li>
                                                {currencyFormatter.format(
                                                    menuItems[item]?.price
                                                )}
                                            </li>
                                            <li>
                                                {menuItems[item]?.description}
                                            </li>
                                            <li>
                                                {menuItems[
                                                    item
                                                ]?.health_requirements?.join(
                                                    ", "
                                                )}
                                            </li>
                                        </ol>
                                    </CardContent>
                                    <CardActions className="grid grid-cols-2">
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
                onDeleteCategory={() => handleCategoriesChanged()}
                menuItems={menuItems}
            />
            <ManagerMenuCreateCategoryDialog
                showDialog={showCreateCategoryDialog}
                onClose={() => setShowCreateCategoryDialog(false)}
                onCreateCategory={handleNewCategoryCreated}
            />
            <ManagerBottomBar currentPageName="MenuManagement" />
        </Box>
    );
};

export default ManagerMenu;
