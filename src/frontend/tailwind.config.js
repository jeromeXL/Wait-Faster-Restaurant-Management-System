/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: "#e3f2fd",
                    main: "#90caf9",
                    DEFAULT: "#90caf9",
                    dark: "#42a5f5",
                },
                secondary: {
                    light: "#f3e5f5",
                    main: "#ce93d8",
                    DEFAULT: "#ce93d8",
                    dark: "#ab47bc",
                },
                error: {
                    light: "#e57373",
                    main: "#f44336",
                    DEFAULT: "#f44336",
                    dark: "#d32f2f",
                },
                warning: {
                    light: "#ffb74d",
                    main: "#ffa726",
                    DEFAULT: "#ffa726",
                    dark: "#f57c00",
                },
                info: {
                    light: "#4fc3f7",
                    main: "#29b6f6",
                    DEFAULT: "#29b6f6",
                    dark: "#0288d1",
                },
                success: {
                    light: "#81c784",
                    main: "#66bb6a",
                    DEFAULT: "#66bb6a",
                    dark: "#388e3c",
                },
            },
        },
    },
    plugins: [],
};
