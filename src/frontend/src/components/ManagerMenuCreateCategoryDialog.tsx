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
    CategoryResponse,
    CreateCategoryRequest,
    createCategory,
    stringifyApiError,
} from "../utils/api";
import { AxiosError } from "axios";

// Edit Category Dialog
const CreateCategoryDialog = ({
    showDialog,
    onClose,
    onCreateCategory,
}: {
    showDialog: boolean;
    onClose: () => void;
    onCreateCategory: (category: CategoryResponse) => Promise<unknown>;
}) => {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [categoryName, setCategoryName] = useState<string | undefined>("");
    const onSubmit = async () => {
        // Construct a new category object
        const request: CreateCategoryRequest = {
            name: categoryName ?? "",
            menu_items: [],
        };

        // Make a request to the create category api
        return await createCategory(request)
            .then(async (resp) => await onCreateCategory(resp))
            .catch((error) => {
                setFormError(stringifyApiError(error));
            });
    };

    useEffect(() => {
        setCategoryName("");
        setFormError("");
    }, [showDialog]);

    return (
        <Dialog open={showDialog} onClose={onClose}>
            <DialogTitle>Create Category</DialogTitle>
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateCategoryDialog;
