import { Button, Chip, TextField } from "@mui/material";
import { useState } from "react";

const TextListInput = ({
    label,
    values,
    onUpdate,
}: {
    label: string;
    values: string[];
    onUpdate: (values: string[]) => void;
}) => {
    const [value, setValue] = useState<string | null>(null);

    function onAddValue(valueToAdd: string) {
        if (values.includes(valueToAdd)) {
            return onUpdate(values);
        }

        onUpdate([...values, valueToAdd]);
        setValue("");
    }

    function onRemoveValue(valueToRemove: string) {
        if (values.includes(valueToRemove)) {
            return onUpdate(values.filter((x) => x !== valueToRemove));
        }

        return onUpdate(values);
    }

    return (
        <div>
            <div className="flex flex-row">
                <TextField
                    autoFocus
                    margin="dense"
                    label={label}
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={value}
                    onInput={(e) =>
                        setValue((e.target as HTMLInputElement).value)
                    }
                    onKeyDown={(keyEvent: KeyboardEvent) => {
                        if (keyEvent.key != "Enter") return;
                        if (value == null || value === "") {
                            return;
                        }
                        onAddValue(value);
                    }}
                />
                <Button
                    onClick={() => {
                        if (value == null || value === "") {
                            return;
                        }
                        onAddValue(value);
                    }}
                >
                    Add
                </Button>
            </div>
            <div>
                {values.map((value) => (
                    <Chip
                        className="pt-1 pb-2"
                        key={value}
                        label={value}
                        size="small"
                        onDelete={() => onRemoveValue(value)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TextListInput;
