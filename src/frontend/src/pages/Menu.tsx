// Menu page for customers
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import {useNavigate} from 'react-router-dom';

const Search = styled('div')(() => ({
    position: 'relative',
    borderRadius: 10,
    height: '50px',
    width: '100%',
    backgroundColor: '#38353A' 
}));

const StyledInputBase = styled(InputBase)(() => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      paddingLeft: '20px', 
    },
}));

const Menu = () => {
    return (
        <Box>
            <AppBar position="static" style={{WebkitAlignContent: 'center', background: '#F0F0F0', minHeight: "70px" }}>
                <Toolbar>
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1, color: '#7E2F30', fontWeight: "bold"}}>
                        Welcome To The Menu
                    </Typography>
                    <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 10, maxHeight: '50px', minHeight: '50px', borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                        Call Staff
                    </Button>
                    <Button variant="contained" style={{backgroundColor: '#F0F0F0', borderRadius: 10, maxHeight: '50px', minHeight: '50px', borderColor: "#38353A", borderWidth: "1.5px"}}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                    </Button>
                </Toolbar>
                <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: '20px'}}>
                    <Search>
                        <StyledInputBase
                            placeholder="e.g. Pork, Coriander"
                            inputProps={{ 'aria-label': 'search'}}
                        />
                    </Search>
                    <Button variant="contained" style={{backgroundColor: '#F0F0F0', borderRadius: 10, maxHeight: '50px', minHeight: '50px', borderColor: "#38353A", borderWidth: "1.5px", marginLeft: '20px'}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                    </Button>
                </Box>
            </AppBar>
            <Box>
                <FormGroup>
                    <FormControlLabel control={<Checkbox />} label="Vegan" />
                    <FormControlLabel control={<Checkbox />} label="Vegetarian" />
                    <FormControlLabel control={<Checkbox />} label="Pescatarian" />
                </FormGroup>
            </Box>
        </Box>
    )
} 

export default Menu;
