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
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [itemName, setItemName] = useState<string | undefined>("");
    const [description, setDescription] = useState<string | undefined>("");
    const [price, setPrice] = useState<number | undefined>(undefined);

    const onSubmit = async () => {
        // Construct a new category object
        const request: MenuItemRequest = {
            name: itemName ?? "",
            description: description ?? "",
            price: price ?? 0,
            health_requirements: [],
            ingredients: [],
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
