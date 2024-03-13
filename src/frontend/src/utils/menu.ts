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
	name: string,
	price: number,
	dietary_details: DietaryDetail[],
	description: string,
}

export type Category = {
	id: string
	name: string,
	items: string[]
}
export type Menu = {
	categories : Category[]
}