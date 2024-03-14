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
    CreateMenuItemRequest,
    MenuItemResponse,
    deleteMenuItem,
    editMenuItem,
    stringifyApiError,
} from "../utils/api";

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

    const onSubmit = async () => {
        // Construct a new category object
        const request: CreateMenuItemRequest = {
            name: itemName ?? "",
            description: description ?? "",
            price: price ?? 0,
            health_requirements: [],
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
