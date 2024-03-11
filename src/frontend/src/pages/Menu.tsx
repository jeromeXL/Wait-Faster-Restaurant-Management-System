// Menu page for customers
import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Chip, Container, TextField, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Popover from '@mui/material/Popover';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import {useNavigate} from 'react-router-dom';

const Menu = () => {

  const navigate = useNavigate(); 

  const Search = styled('div')(() => ({
    display: 'flex', 
    alignItems: 'center',
    position: 'relative',
    borderRadius: 30,
    height: '40px',
    width: '100%',
    backgroundColor: '#FFFFFF', 
    paddingLeft: '20px'
  }));

  const StyledInputBase = styled(InputBase)(() => ({
      color: '#38353A',
      width: '100%',
      '& .MuiInputBase-input': {
      },
  }));

  const [staffCalled, setStaffCalled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const callStaff = () => {
    setStaffCalled(!staffCalled);
    staffCalled ? "" : setSnackbarOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleCancel = () => {
    setStaffCalled(false);
    setSnackbarOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button style={{ color: '#F0F0F0' }} onClick={handleCancel}>
        Cancel
      </Button>
      <Button style={{ color: '#F0F0F0' }} onClick={handleClose}>
        Dismiss
      </Button>
    </React.Fragment>
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
  });
  const [selectedFilters, setSelectedFilters] = useState([]);

  const openFilters = (event) => {
    setAnchorEl(event.currentTarget);
  };

const closeFilters = () => {
    setAnchorEl(null);
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;
    setFilterOptions({ ...filterOptions, [name]: checked });
    if (checked) {
      setSelectedFilters([...selectedFilters, name]);
    } else {
      setSelectedFilters(selectedFilters.filter(filter => filter !== name));
    }
  };

  const clearFilters = () => {
    setFilterOptions({
      option1: false,
      option2: false,
      option3: false,
    });
    setSelectedFilters([]);
  };

  const clearFilterChip = (filter) => {
    setFilterOptions({ ...filterOptions, [filter]: false });
    setSelectedFilters(selectedFilters.filter(selected => selected !== filter));
  };

  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  return (
    <Box sx={{bgcolor:"#38353A"}}>
        <AppBar position="static" style={{WebkitAlignContent: 'center', background: '#F0F0F0', minHeight: "60px"}}>
            <Toolbar>
                <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: '#38353A', fontWeight: "bold"}}>
                    Welcome To The Menu
                </Typography>
                <Button variant="contained" style={{borderRadius: 10, maxHeight: '35px', minHeight: '35px', borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}
                  color={staffCalled ? "success" : "primary"}
                  onClick={callStaff}
                >
                    Call Staff
                </Button>
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={6000}
                  onClose={handleClose}
                  message="Staff has been called"
                  action={action}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
                >
                  <SnackbarContent
                  sx={{ width: '400px', height: '60px', borderRadius: '10px', backgroundColor: '#35383A', color: '#F0F0F0', }}
                  message={
                    <Typography variant="h6">
                      Staff has been called
                    </Typography>
                  }
                  action={action}
                  />
                </Snackbar>
                <Button variant="contained" style={{backgroundColor: '#F0F0F0', borderRadius: 10, maxHeight: '35px', minHeight: '35px', width: '35px', borderColor: "#38353A", borderWidth: "1.5px"}}
                  onClick={() => {
                    navigate('/Cart');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </Button>
            </Toolbar>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginInline: '20px', marginBottom: '10px'}}>
                <Search>
                  {selectedFilters.length === 0 && (
                    <StyledInputBase
                        placeholder="e.g. Pork, Coriander"
                        inputProps={{ 'aria-label': 'search'}}
                    />
                  )}
                  {selectedFilters.map(filter => (
                    <Chip
                      key={filter}
                      label={filter}
                      onDelete={() => clearFilterChip(filter)}
                      style={{ margin: '0 5px 5px 0' }}
                    />
                  ))}
                  {selectedFilters.length > 0 && (
                    <Button onClick={clearFilters}>
                    </Button>
                  )}
                </Search>
                <Button variant="contained" style={{backgroundColor: '#F0F0F0', borderRadius: 10, height: '35px', borderColor: "#38353A", borderWidth: "1.5px", marginLeft: '20px'}}
                  onClick={openFilters}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={closeFilters}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{padding: "20px"}}>
                    <Typography variant="h6">Filter Options</Typography>
                    <FormControlLabel
                    control={<Checkbox checked={filterOptions.option1} onChange={(event) => handleChange(event)} name="option1" />}
                    label="Option 1"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={filterOptions.option2} onChange={(event) => handleChange(event)} name="option2" />}
                      label="Option 2"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={filterOptions.option3} onChange={(event) => handleChange(event)} name="option3" />}
                      label="Option 3"
                    />
                  </Box>
                </Popover>
            </Box>
            <Box sx={{paddingBottom: '15px'}}>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Featured Items
              </Button>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Entree
              </Button>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Appetiser
              </Button>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Main
              </Button>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Dessert
              </Button>
              <Button variant="contained" style={{backgroundColor: '#F0F0F0', color: '#38353A', borderRadius: 50, height: "35px", borderColor: "#38353A", borderWidth: "1.5px", paddingInline: "15px", marginInline: "20px" }}>
                Beverages
              </Button>
            </Box>
        </AppBar>
        <Box sx={{padding: '20px'}}>
          <Box>
            <Card sx={{ maxWidth: 345 }}>
              <CardHeader
                title="Angus Rump Steak"
              />
              <CardMedia
                component="img"
                height="200"
                image="LoginBG"
              />
              <CardContent>
                <Typography variant="h6">
                  220g. Grainage black Angus and grain fed one hundred and fifty days. Come MSA assured steaks are served with chips, salad and your choice of sauce.
                </Typography>
              </CardContent>
              <Button>
                -
              </Button>
              <Button>
                +
              </Button>
            </Card>
          </Box>
      </Box>
    </Box>
  )
} 

export default Menu;
