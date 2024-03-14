export enum DietaryDetail {
    GLUTEN_FREE = "Gluten Free",
    VEGETARIAN = "Vegetarian",
    VEGAN = "Vegan",
    SPICY = "Spicy",
    CONTAINS_NUTS = "Contains Nuts",
    CONTAINS_EGGS = "Contains Eggs",
    CONTAINS_SOY = "Contains Soy",
}

export type MenuItem = {
    id: string;
    name: string;
    price: number;
    health_requirements: DietaryDetail[];
    description: string;
};

export type Category = {
    id: string;
    name: string;
    menu_items: string[];
    index: number;
};
export type Menu = {
    categories: Category[];
};
