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
import {
    MenuItemRequest,
    MenuItemResponse,
    createMenuItem,
    stringifyApiError,
} from "../utils/api";
import TextListInput from "./Inputs/TextListInput";

// Edit Category Dialog
const ManagerMenuCreateItemDialog = ({
    showDialog,
    onClose,
    onCreateMenuItem,
}: {
    showDialog: boolean;
    onClose: () => void;
    onCreateMenuItem: (menuItem: MenuItemResponse) => Promise<unknown>;
}) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [itemName, setItemName] = useState<string | null>("");
    const [description, setDescription] = useState<string | null>("");
    const [price, setPrice] = useState<number | null>(null);
    const [image, setImage] = useState<string | null>("");
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
            photo_url: image === "" ? null : image,
        };

        // Make a request to the create category api
        return await createMenuItem(request)
            .then(async (resp) => await onCreateMenuItem(resp))
            .catch((error) => {
                setFormError(stringifyApiError(error));
            });
    };

    useEffect(() => {
        setItemName("");
        setDescription("");
        setPrice(0);
        setFormError("");
        setImage("");
        setHealthRequirements([]);
        setIngredients([]);
    }, [showDialog]);

    return (
        <Dialog open={showDialog} onClose={onClose}>
            <DialogTitle>Create Menu Item</DialogTitle>
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManagerMenuCreateItemDialog;
