// Menu page for customers
import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Chip, Typography } from "@mui/material";
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
import Steak from '../assets/Steak.jpeg'

const Menu = () => {

  const navigate = useNavigate(); 
  const [staffCalled, setStaffCalled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const Search = styled('div')(() => ({
    display: 'flex', 
    alignItems: 'center',
    position: 'relative',
    borderRadius: 30,
    height: '35px',
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

  const TypeButton = ({ children, ...props }: { children: React.ReactNode }) => {
    return (
      <Button
        variant="contained"
        style={{
          flex: 1, 
          backgroundColor: '#F0F0F0',
          color: '#38353A',
          borderRadius: 50,
          height: "30px",
          borderColor: "#38353A",
          borderWidth: "1.5px",
          paddingInline: "15px"
        }}
        {...props}
      >
        {children}
      </Button>
    );
  };
  
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
    setStaffCalled(!staffCalled);
    setSnackbarOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button 
        style={{ color: '#F0F0F0' }} 
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button 
        style={{ color: '#F0F0F0' }} 
        onClick={handleClose}
      >
        Dismiss
      </Button>
    </React.Fragment>
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const open = Boolean(anchorEl);
  const id = open ? 'filter-popover' : undefined;

  const [filterOptions, setFilterOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

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

  const clearFilterChip = (filter: string) => {
    setFilterOptions({ ...filterOptions, [filter]: false });
    setSelectedFilters(selectedFilters.filter(selected => selected !== filter));
  };

  const [quantity, setQuantity] = useState(0);

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const addToCart = () => { 
    setQuantity(0); 
  }

  return (
    <Box 
      sx={{bgcolor:"#38353A"}}
    >
      <AppBar 
        position="fixed" 
        elevation={1}
        style={{
          WebkitAlignContent: 'center', 
          background: '#38353A', 
          minHeight: "60px"
        }}
      >
        <Toolbar>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: '#F0F0F0', 
              fontWeight: "bold"
            }}
          >
            Welcome To The Menu
          </Typography>
          <Button 
            variant="contained" 
            style={{
              borderRadius: 10, 
              height: '35px',
              borderColor: "#38353A", 
              borderWidth: "1.5px", 
              paddingInline: "15px", 
              marginInline: "20px" 
            }}
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
              sx={{ 
                width: '400px', 
                height: '60px', 
                borderRadius: '10px', 
                backgroundColor: '#35383A', 
                color: '#F0F0F0', 
              }}
              message={
                <Typography variant="h6">
                  Staff has been called
                </Typography>
              }
              action={action}
            />
          </Snackbar>
          <Button variant="contained" 
            style={{
              backgroundColor: '#F0F0F0', 
              borderRadius: 10, 
              height: '35px', 
              width: '35px', 
              borderColor: "#38353A", 
              borderWidth: "1.5px"
            }}
            onClick={() => {
              navigate('/Cart');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </Button>
        </Toolbar>
        <Box 
          sx={{
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginInline: '20px', 
            marginBottom: '10px'
          }}
        >
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
                style={{ margin: '0 5px 5px 0', height: '25px' }}
              />
            ))}
            {selectedFilters.length > 0 && (
              <Button onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Search>
          <Button 
            variant="contained" 
            style={{
              backgroundColor: '#F0F0F0', 
              borderRadius: 10, 
              height: '35px', 
              borderColor: "#38353A", 
              borderWidth: "1.5px", 
              marginLeft: '20px'
            }}
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
              <Typography variant="h6">
                Filter Options
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filterOptions.option1} 
                    onChange={(event) => handleChange(event)} 
                    name="option1" 
                  />}
                label="Option 1"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filterOptions.option2} 
                    onChange={(event) => handleChange(event)} 
                    name="option2" 
                  />}
                label="Option 2"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filterOptions.option3} 
                    onChange={(event) => handleChange(event)} 
                    name="option3" 
                  />}
                label="Option 3"
              />
            </Box>
          </Popover>
        </Box>
        <div style={{ overflowX: 'auto' }}> 
          <Box sx={{paddingX: '20px', paddingBottom: '10px', display: 'flex', gap: '10px'}}>
            <TypeButton>
              Featured Items
            </TypeButton>
            <TypeButton>
              Entree
            </TypeButton>
            <TypeButton>
              Appetiser
            </TypeButton>
            <TypeButton>
              Main
            </TypeButton>
            <TypeButton>
              Dessert
            </TypeButton>
            <TypeButton>
              Beverages
            </TypeButton>  
          </Box>
        </div>
      </AppBar>
      <Box sx={{paddingTop: "150px", paddingX: '20px'}}>
        <Typography variant="h5" color="#F0F0F0" sx={{fontWeight: "bold", paddingY: "10px"}}>
          Featured items
        </Typography>
        <Box 
          sx={{
            display: 'flex', 
            flexWrap: 'wrap', 
            flexDirection: 'row', 
            justifyContent: 'flex-start', 
            columnGap: '10px', 
            rowGap: '15px'
          }}
        >
          <Card sx={{ maxWidth: 300}}>
            <CardHeader
              title="Angus Rump Steak"
            />
            <CardMedia
              component="img"
              height="200"
              image={Steak}
            />
            <CardContent>
              <Typography>
                220g. Grainage black Angus and grain fed one hundred and fifty days. Come MSA assured steaks are served with chips, salad and your choice of sauce.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Chip label="Nut-Free" />
                <Typography> 
                $25
                </Typography>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <Button variant="outlined" onClick={decrementQuantity} sx={{ paddingInline: '15px', minWidth: 0 }}>
                  -
                </Button>
                <Typography variant="body1" sx={{ marginX: '10px' }}>{quantity}</Typography>
                <Button variant="outlined" onClick={incrementQuantity} 
                  sx={{ paddingInline: '15px',
                    minWidth: 0 
                  }}
                >
                  +
                </Button>
                <Button variant="contained" onClick={addToCart}>Add To Cart</Button>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 300}}>
            <CardHeader
              title="Angus Rump Steak"
            />
            <CardMedia
              component="img"
              height="200"
              image={Steak}
            />
            <CardContent>
              <Typography>
                220g. Grainage black Angus and grain fed one hundred and fifty days. Come MSA assured steaks are served with chips, salad and your choice of sauce.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Chip label="Nut-Free" />
                <Typography> 
                $25
                </Typography>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <Button variant="outlined" onClick={decrementQuantity} sx={{ paddingInline: '15px', minWidth: 0 }}>
                  -
                </Button>
                <Typography variant="body1" sx={{ marginX: '10px' }}>{quantity}</Typography>
                <Button variant="outlined" onClick={incrementQuantity} 
                  sx={{ paddingInline: '15px',
                    minWidth: 0 
                  }}
                >
                  +
                </Button>
                <Button variant="contained" onClick={addToCart}>Add To Cart</Button>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ maxWidth: 300}}>
            <CardHeader
              title="Angus Rump Steak"
            />
            <CardMedia
              component="img"
              height="200"
              image={Steak}
            />
            <CardContent>
              <Typography>
                220g. Grainage black Angus and grain fed one hundred and fifty days. Come MSA assured steaks are served with chips, salad and your choice of sauce.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <Chip label="Nut-Free" />
                <Typography> 
                $25
                </Typography>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <Button variant="outlined" onClick={decrementQuantity} sx={{ paddingInline: '15px', minWidth: 0 }}>
                  -
                </Button>
                <Typography variant="body1" sx={{ marginX: '10px' }}>{quantity}</Typography>
                <Button variant="outlined" onClick={incrementQuantity} 
                  sx={{ paddingInline: '15px',
                    minWidth: 0 
                  }}
                >
                  +
                </Button>
                <Button variant="contained" onClick={addToCart}>Add To Cart</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
} 

export default Menu;
