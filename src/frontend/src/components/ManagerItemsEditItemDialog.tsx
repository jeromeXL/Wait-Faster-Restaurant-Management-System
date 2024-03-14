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
import { Category } from "../utils/menu";
import {
    CategoryResponse,
    CreateCategoryRequest,
    deleteCategory,
    stringifyApiError,
    updateCategory,
} from "../utils/api";

// Edit Category Dialog
const ManagerMenuEditItemDialog = ({
    showDialog,
    onClose,
    onEditCategory,
    onDeleteCategory,
    category,
}: {
    showDialog: boolean;
    onClose: () => void;
    onEditCategory: (category: CategoryResponse) => Promise<unknown>;
    onDeleteCategory: () => Promise<unknown>;
    category: Category | undefined;
}) => {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [categoryName, setCategoryName] = useState<string | undefined>(
        category?.name
    );

    const onSubmit = async () => {
        // Construct a new category object
        const updateCategoryRequest: CreateCategoryRequest = {
            name: categoryName ?? "",
            menu_items: category?.menu_items ?? [],
        };

        return await updateCategory(category?.id ?? "", updateCategoryRequest)
            .then(async (resp) => await onEditCategory(resp))
            .catch((error) => {
                setFormError(stringifyApiError(error));
            });
    };

    const onDelete = async () => {
        return await deleteCategory(category?.id ?? "")
            .then(async () => await onDeleteCategory())
            .catch((err) => {
                setFormError(stringifyApiError(err));
            });
    };

    useEffect(() => {
        setCategoryName(category?.name);
        setFormError("");
    }, [category?.id]);

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
