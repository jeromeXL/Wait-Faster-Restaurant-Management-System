import { Button } from "@mui/base";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MenuItem } from "../utils/menu";
import {
    MenuItemRequest,
    MenuItemResponse,
    deleteMenuItem,
    editMenuItem,
    stringifyApiError,
} from "../utils/api";
import TextListInput from "./Inputs/TextListInput";

// Edit Category Dialog
const ManagerMenuEditItemDialog = ({
    showDialog,
    onClose,
    onEditMenuItem,
    onDeleteMenuItem,
    menuItem,
}: {
    showDialog: boolean;
    onClose: () => void;
    onEditMenuItem: (menuItem: MenuItemResponse) => Promise<unknown>;
    onDeleteMenuItem: () => Promise<unknown>;
    menuItem: MenuItem | undefined;
}) => {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [itemName, setItemName] = useState<string | undefined>("");
    const [description, setDescription] = useState<string | undefined>("");
    const [price, setPrice] = useState<number | undefined>(undefined);
    const [image, setImage] = useState<string | null>(null);
    const [healthRequirements, setHealthRequirements] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);

    const onSubmit = async () => {
        // Construct a new category object
        const request: MenuItemRequest = {
            name: itemName ?? "",
            description: description ?? "",
            price: price ?? 0,
            health_requirements: healthRequirements,
            ingredients: ingredients,
            photo_url: image,
        };

        // Make a request to the create category api
        return await editMenuItem(menuItem!.id!, request)
            .then(async (resp) => await onEditMenuItem(resp))
            .catch((error) => {
                setFormError(stringifyApiError(error));
            });
    };

    const onDelete = async () => {
        return await deleteMenuItem(menuItem?.id ?? "")
            .then(async () => await onDeleteMenuItem())
            .catch((err) => {
                setFormError(stringifyApiError(err));
            });
    };

    useEffect(() => {
        setItemName(menuItem?.name);
        setDescription(menuItem?.description);
        setPrice(menuItem?.price);
        setImage(menuItem?.photo_url ?? "");
        setHealthRequirements(menuItem?.health_requirements ?? []);
        setIngredients(menuItem?.ingredients ?? []);
        setFormError("");
    }, [menuItem?.id]);

    return (
        <Dialog open={showDialog} onClose={onClose}>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Price"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    autoFocus
                    margin="dense"
                    label="Image Url"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />
                <TextListInput
                    label="Ingredients"
                    values={ingredients}
                    onUpdate={(values) => setIngredients(values)}
                />
                <TextListInput
                    label="Dietary Details"
                    values={healthRequirements}
                    onUpdate={(values) => setHealthRequirements(values)}
                />
                <Typography color="error"> {formError}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDelete} color="error">
                    Delete
                </Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManagerMenuEditItemDialog;
