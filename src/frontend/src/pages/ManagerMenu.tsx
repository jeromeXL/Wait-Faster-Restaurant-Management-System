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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { Category, DietaryDetail, Menu, MenuItem } from "../utils/menu";
import UpArrowIcon from "../components/Icons/UpArrowIcon";
import DownArrowIcon from "../components/Icons/DownArrowIcon";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AUD",
});

const menuItems: Record<string, MenuItem> = {
    id_one: {
        name: "Cabbage rolls",
        description: "6 cabbage rolls.",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
    id_two: {
        name: "Chinese Broccoli",
        description: "Fried broccoli with oyster sauce.",
        dietary_details: [
            DietaryDetail.CONTAINS_NUTS,
            DietaryDetail.CONTAINS_SOY,
            DietaryDetail.VEGETARIAN,
        ],
        price: 7.5,
    },
    id_three: {
        name: "Packaged Carrot",
        description: "Carrot",
        dietary_details: [DietaryDetail.VEGETARIAN],
        price: 15.0,
    },
    id_four: {
        name: "Cheese stick",
        description: "Cheese stick",
        dietary_details: [],
        price: 9.0,
    },
    id_five: {
        name: "Dumplings",
        description: "Dumplings",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
    id_six: {
        name: "Bolognese",
        description: "Bolognese",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
    id_seven: {
        name: "Fettuccine",
        description: "Fettuccine",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
    id_eight: {
        name: "Buffalo wing",
        description: "Buffalo wing.",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
    id_nine: {
        name: "Pork",
        description: "Pork.",
        dietary_details: [DietaryDetail.CONTAINS_NUTS],
        price: 15.0,
    },
};
const ManagerMenu = () => {
    // Edit Category Dialog
    const EditCategoryDialog = ({
        showDialog,
        onClose,
        onEditCategory,
        category,
    }: {
        showDialog: boolean;
        onClose: () => void;
        onEditCategory: (category: Category) => Promise<unknown>;
        category: Category;
    }) => {
        const [categoryName, setCategoryName] = useState<string>(category.name)
        const onSubmit = () => {
            // Construct a new category object 
            const newCategory : Category = {
                ...category,
                name: categoryName
            }

            
        };

        return (
            <Dialog open={showDialog} onClose={onClose}>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Category Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={onSubmit}>Confirm</Button>
                </DialogActions>
            </Dialog>
        );
    };

    // MAIN PAGE
    const [menu, setMenu] = useState<Menu | null>({ categories: [] });
    useEffect(() => {
        // Todo: replace with an async call to fetch the menu.
        setMenu({
            categories: [
                {
                    id: "Veggies1",
                    name: "Veggies",
                    items: ["id_one", "id_two", "id_three"],
                },
                {
                    id: "Meat1",
                    name: "Meat",
                    items: ["id_four", "id_five", "id_six"],
                },
                {
                    id: "OtherItems1",
                    name: "Other Items",
                    items: ["id_seven", "id_eight", "id_nine"],
                },
            ],
        });
    }, []);

    // Dialog Controls
    const [showEditCategoryDialog, setShowEditCategoryDialog] =
        useState<boolean>(false);
    const [lastClickedEditCategory, setLastClickedEditCategory] =
        useState<Category | null>(null);
    const handleEditCategory = (category: Category) => {
        setLastClickedEditCategory(category);
        setShowEditCategoryDialog(true);
    };

    const [expandedCategoryName, setExpandedCategoryName] = useState<
        string | undefined
    >(menu?.categories[0]?.name);

    const isLastItemInCategory = (category: Category, itemId: string) =>
        category.items[category.items.length - 1] == itemId;
    const isFirstItemInCategory = (category: Category, itemId: string) =>
        category.items[0] == itemId;

    const isLastCategory = (categoryName: string) =>
        menu?.categories[menu.categories.length - 1].name == categoryName;
    const isFirstCategory = (categoryName: string) =>
        menu?.categories[0].name == categoryName;

    const handleReorderCategories = async (
        categoryId: string,
        movementDirection: "Up" | "Down"
    ) => {
        // Get the categories as a list of names
        const list = menu?.categories.map((x) => x.name);
        if (list == null) {
            return Promise.reject("No categories to re-order.");
        }

        // Get the indexes of the two items that need to be swapped.
        const targetItemIndex = list?.indexOf(categoryId);
        const isValidMovement =
            (movementDirection == "Down" &&
                targetItemIndex != list.length - 1) ||
            (movementDirection == "Up" && targetItemIndex != 0);
        if (!isValidMovement) {
            return Promise.reject("Cannot move category in that direction.");
        }

        const indexToMoveTargetTo =
            targetItemIndex + (movementDirection == "Up" ? -1 : 1);

        // Swap targetItemIndex and indexToMoveTargetTo
        const temp = list[targetItemIndex];
        list[targetItemIndex] = list[indexToMoveTargetTo];
        list[indexToMoveTargetTo] = temp;

        // Send an http request and re-organize the list.
        // TEMP - SORT THE CATEGORIES
        console.log(list);
        const sortedCategories = [];
        for (const category of list) {
            sortedCategories.push(
                menu!.categories.find((x) => x.name == category)!
            );
        }

        setMenu({
            categories: sortedCategories,
        } satisfies Menu);
    };

    const handleReorderMenuItems = async (
        category: Category,
        itemId: string,
        movementDirection: "Up" | "Down"
    ) => {
        // Get the list of items
        const items = category.items;

        // Get the indexes of the two items that need to be swapped
        const targetItemIndex = items.indexOf(itemId);
        const isValidMovement =
            (movementDirection == "Down" &&
                targetItemIndex != items.length - 1) ||
            (movementDirection == "Up" && targetItemIndex != 0);
        if (!isValidMovement) {
            return Promise.reject("Cannot move item in that direction.");
        }

        const indexToMoveTargetTo =
            targetItemIndex + (movementDirection == "Up" ? -1 : 1);

        // Swap targetItemIndex and indexToMoveTargetTo
        const temp = items[targetItemIndex];
        items[targetItemIndex] = items[indexToMoveTargetTo];
        items[indexToMoveTargetTo] = temp;

        // Send an http request and re-organize the items.
        // TEMP - SORT THE CATEGORIES
        const sortedItems = [];
        for (const item of items) {
            sortedItems.push(category.items.find((x) => x == item)!);
        }

        // Update the category
        category.items = items;
        const oldCategoryIndex = menu?.categories.findIndex(
            (x) => x.name == category.name
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
                {menu.categories.map((category, index) => (
                    <Accordion
                        key={index}
                        sx={{
                            bgcolor: "white",
                        }}
                        expanded={category.name == expandedCategoryName}
                        onChange={() => setExpandedCategoryName(category.name)}
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
                                    {isFirstCategory(category.name) ? null : (
                                        <Button
                                            sx={{
                                                gridColumnStart: 1,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                return handleReorderCategories(
                                                    category.name,
                                                    "Up"
                                                );
                                            }}
                                        >
                                            <UpArrowIcon />
                                        </Button>
                                    )}
                                    {isLastCategory(category.name) ? null : (
                                        <Button
                                            sx={{
                                                gridColumnStart: 2,
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                return handleReorderCategories(
                                                    category.name,
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
                                        onClick={() => handleEditCategory(category)}
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
                            {category.items.map((item) => (
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
                                                ].dietary_details.join(", ")}
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
            <EditCategoryDialog
                showDialog={showEditCategoryDialog}
                onClose={() => setShowEditCategoryDialog(false)}
                category={lastClickedEditCategory!}
                onEditCategory={async () => {}}
            />
        </Box>
    );
};

export default ManagerMenu;
