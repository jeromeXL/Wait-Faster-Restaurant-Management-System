import { Button } from "@mui/base";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
    TableContainer,
    Paper,
    TableHead,
    Table,
    TableCell,
    TableRow,
    TableBody,
    Checkbox,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Category, MenuItem } from "../utils/menu";
import {
    CategoryResponse,
    CreateCategoryRequest,
    deleteCategory,
    stringifyApiError,
    updateCategory,
} from "../utils/api";
import currencyFormatter from "../utils/currencyFormatter";

// Edit Category Dialog
const EditCategoryDialog = ({
    showDialog,
    onClose,
    onEditCategory,
    onDeleteCategory,
    category,
    menuItems,
}: {
    showDialog: boolean;
    onClose: () => void;
    onEditCategory: (category: CategoryResponse) => Promise<unknown>;
    onDeleteCategory: () => Promise<unknown>;
    category: Category | undefined;
    menuItems: Record<string, MenuItem>;
}) => {
    const [formError, setFormError] = useState<string | undefined>(undefined);
    const [categoryName, setCategoryName] = useState<string | undefined>(
        category?.name
    );
    const [menuItemsInCategory, setMenuItemsInCategory] = useState<string[]>(
        []
    );
    
    useEffect(() => {
        setCategoryName(category?.name);
        setMenuItemsInCategory(category?.menu_items ?? []);
        setFormError("");
    }, [category?.id]);


    const onSubmit = async () => {
        // Construct a new category object
        const updateCategoryRequest: CreateCategoryRequest = {
            name: categoryName ?? "",
            menu_items: menuItemsInCategory ?? [],
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

    const itemInCategoryChanged = (itemId: string) => {
        if (menuItemsInCategory.includes(itemId)) {
            setMenuItemsInCategory(menuItemsInCategory.filter(x => x != itemId))
        } else {
            setMenuItemsInCategory(menuItemsInCategory.concat([itemId]))
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
                <Typography color="error"> {formError}</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell> In Category </TableCell>
                                <TableCell> Item Name </TableCell>
                                <TableCell> Item Price </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.values(menuItems).map((menuItem) => (
                                <TableRow key={menuItem.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={menuItemsInCategory.includes(
                                                menuItem.id
                                            )}
                                            onChange={() => itemInCategoryChanged(menuItem.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{menuItem.name}</TableCell>
                                    <TableCell>
                                        {currencyFormatter.format(
                                            menuItem.price
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
export default EditCategoryDialog;
