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
import AccordionActions from "@mui/material/AccordionActions";
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
    const [menu, setMenu] = useState<Menu | null>({ categories: [] });
    const [expandedCategoryName, setExpandedCategoryName] = useState<
        string | undefined
    >(menu?.categories[0]?.name);

    useEffect(() => {
        // Todo: replace with an async call to fetch the menu.
        setMenu({
            categories: [
                {
                    name: "Veggies",
                    items: ["id_one", "id_two", "id_three"],
                },
                {
                    name: "Meat",
                    items: ["id_four", "id_five", "id_six"],
                },
                {
                    name: "Other Items",
                    items: ["id_seven", "id_eight", "id_nine"],
                },
            ],
        });
    }, []);

	const isLastItemInCategory = (category: Category, itemId: string) => {
		
	}

    const handleReorderCategories = async (
        categoryName: string,
        movementDirection: "Up" | "Down"
    ) => {};

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
                        <AccordionSummary>{category.name}</AccordionSummary>

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
                                    <CardActions>
                                        <Button>
                                            <UpArrowIcon />
                                        </Button>
                                        <Button>
                                            <DownArrowIcon />
                                        </Button>
                                        <Button size="small">Manage</Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </Box>
    );
};

export default ManagerMenu;
