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
import { DietaryDetail } from '../utils/menu';
import Item_one from '../assets/menuPhotos/item_one.jpeg'
import Item_two from '../assets/menuPhotos/Bruschetta.jpeg'
import Item_three from '../assets/menuPhotos/CheeseSticks.jpeg'
import Item_four from '../assets/menuPhotos/Calamari.jpeg'
import Item_five from '../assets/menuPhotos/SweetWedges.jpeg'
import Item_six from '../assets/menuPhotos/Carbonara.jpeg'
import Item_seven from '../assets/menuPhotos/Steak.jpeg'
import Item_eight from '../assets/menuPhotos/Tiramisu.jpeg'
import Item_nine from '../assets/menuPhotos/LemonPie.jpeg'
import Item_ten from '../assets/menuPhotos/AppleJuice.jpeg'
import Item_eleven from '../assets/menuPhotos/OrangeMocktail.jpeg'

const Menu = () => {

  const menu = {
  "categories" : [
      {
        "name" : "Featured Items",
        "items" : [
            "id_two",
            "id_four",
            "id_six",
            "id_eight"
        ]
      },
      {
          "name" : "Starters",
          "items" : [
              "id_one",
              "id_two",
              "id_three", 
              "id_four",
              "id_five"
          ]
      },
      {
          "name" : "Main",
          "items" : [
              "id_six",
              "id_seven",
          ]
      },
      {
          "name" : "Dessert",
          "items" : [
              "id_eight",
              "id_nine"
          ]
      },
      {
        "name" : "Beverages",
        "items" : [
            "id_ten",
            "id_eleven"
        ]
      },
    ]
  }

  const currencyFormatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD', 
  });

  const menuItems: Record<string, MenuItem> = {
    id_one: {
      name: "Garlic Bread",
      price: 7.0,
      dietary_details: [DietaryDetail.VEGETARIAN],
      description: "A combination of bread with fresh parsley, parmesan cheese and garlic",
      image: Item_one
    }, 
    id_two: {
      name: "Bruschetta",
      price: 15.0,
      dietary_details: [DietaryDetail.VEGETARIAN],
      description: "Sourdough topped with freshly diced tomato with garlic, olive oil, oregano and basil",
      image: Item_two
    },
    id_three: {
      name: "Cheese Stick",
      description: "Deep fried batter with creamy and stretchy mozarella cheese within",
      dietary_details: [DietaryDetail.VEGETARIAN],
      price: 9.0,
      image: Item_three
    },
    id_four: {
      name: "Calamari Fritti",
      description: "Salted and pepper calamariwith parmesan aioli sauce and lemon",
      dietary_details: [],
      price: 9.0,
      image: Item_four
    },
    id_five: { 
      name: "Sweet Potato Wedges",
      price: 25.0,
      dietary_details: [],
      description: "Wedges made from sweet potatoes that are crispy on the outside, soft and caramelised inside and coated with sweet and spicy flavours",
      image: Item_five
    },
    id_six: { 
      name: "Sphagetti Cabonara", 
      price: 22.0,
      dietary_details: [DietaryDetail.CONTAINS_EGGS], 
      description: "Sphaghetti with bacon, onions, egg and parmesan cheese",
      image: Item_six
    },
    id_seven: {
      name: "Angus Beef Steak",
      description: "yumyum",
      dietary_details: [],
      price: 28.0,
      image: Item_seven
    },  
    id_eight: { 
      name: "Tiramisu", 
      price: 10.0,
      dietary_details: [DietaryDetail.CONTAINS_EGGS, DietaryDetail.VEGETARIAN], 
      description: "Velvety melange of savoiarddi cookies dipped in an espresso, layered with delicately sweetened whipped eggs and mascarpone cheese", 
      image: Item_eight
    },
    id_nine: { 
      name: "Lemon Meringue Pie", 
      price: 10.0,
      dietary_details: [DietaryDetail.CONTAINS_EGGS, DietaryDetail.VEGETARIAN], 
      description: "Fresh lemon juice and lemon zest filling with billows of bakedd meringue on top for a deliciously dreamy dessert",
      image: Item_nine
    },
    id_ten: { 
      name: "Apple Juice", 
      price: 6.0,
      dietary_details: [], 
      description: "Freshly squeezed apple juice",
      image: Item_ten
    },
    id_eleven: { 
      name: "Orange Mocktail", 
      price: 10.0,
      dietary_details: [], 
      description: "Orange flavoured mocktail", 
      image: Item_eleven
    }
  };

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
  const dietaryRequirements = Object.values(DietaryDetail);

  const initialFilterOptions = dietaryRequirements.reduce((options, requirement) => {
    return { ...options, [requirement]: false };
  }, {});
  
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);

  const openFilters = (event) => {
    setAnchorEl(event.currentTarget);
  };

const closeFilters = () => {
    setAnchorEl(null);
  };

  const checkFilter = (event, option) => {
    const isChecked = event.target.checked;
    setFilterOptions({
      ...filterOptions,
      [option]: isChecked
    });

    if (isChecked) {
      setSelectedFilters([...selectedFilters, option]);
    } else {
      setSelectedFilters(selectedFilters.filter(filter => filter !== option));
    }
  };

  const clearFilters = () => {
    const updatedFilterOptions = {};
    for (const option in filterOptions) {
      updatedFilterOptions[option] = false;
    }
    setFilterOptions(updatedFilterOptions);
    setSelectedFilters([]);
  };

  const clearFilterChip = (filter: string) => {
    setFilterOptions({ ...filterOptions, [filter]: false });
    setSelectedFilters(selectedFilters.filter(selected => selected !== filter));
  };

  const [quantities, setQuantities] = useState({});
  const [cartCounter, setCartCounter] = useState(0); 

  const decrementQuantity = (itemId) => {
    const updatedQuantities = { ...quantities };
    updatedQuantities[itemId] = (updatedQuantities[itemId] || 0) - 1;
    setQuantities(updatedQuantities);
  };
  
  const incrementQuantity = (itemId) => {
    const updatedQuantities = { ...quantities };
    updatedQuantities[itemId] = (updatedQuantities[itemId] || 0) + 1;
    setQuantities(updatedQuantities);
  };
  
  const addToCart = (itemId) => { 
    const updatedQuantities = { ...quantities };  
    setCartCounter(cartCounter + updatedQuantities[itemId]); 
    updatedQuantities[itemId] = 0;
    setQuantities(updatedQuantities); 
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
              borderColor: "#38353A", 
              borderWidth: "1.5px",
              color: "#38353A"
            }}
            onClick={() => {
              navigate('/Cart');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#38353A" className="w-6 h-6" style={{ marginRight: '5px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            Cart ({cartCounter})
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
              <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                Filter Options
              </Typography>
              <Box
                sx={{
                display: "flex",
                flexDirection: "row", 
                flexWrap: "wrap",
                width: "500px"
              }}>
                {Object.keys(filterOptions).map(option => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={filterOptions[option]}
                        onChange={(event) => checkFilter(event, option)}
                      />
                    }
                    label={option}
                  />
                ))} 
              </Box>
            </Box>
          </Popover>
        </Box>
        <div style={{ overflowX: 'auto' }}> 
          <Box sx={{paddingX: '20px', paddingBottom: '10px', display: 'flex', gap: '10px'}}>
            {menu.categories.map(category => (
              <TypeButton key={category.name}>{category.name}</TypeButton>
            ))}
          </Box>
        </div>
      </AppBar>
      <Box sx={{paddingTop: "150px", paddingX: '20px'}}>
        {menu.categories.map((category) => (
          <React.Fragment key={category.name}>
            <Typography variant="h5" sx={{fontWeight: "bold", color: "#F0F0F0", paddingY: '15px'}}>
              {category.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "row",
                justifyContent: "flex-start",
                columnGap: "10px",
                rowGap: "15px",
              }}
            >
              {category.items.map((itemId) => {
                const item = menuItems[itemId];
                const matchesFilters = selectedFilters.every(filter =>
                  item.dietary_details.includes(filter)
                );
                if (matchesFilters || selectedFilters.length === 0) {
                  return (
                    <Card key={itemId} sx={{ maxWidth: 300}}>
                      <CardHeader
                        title={item.name}
                      />
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image}
                        sx={{height:'200px'}}
                      />
                      <CardContent>
                        <Typography variant="body1" height="60px" sx={{overflowY: "auto"}}>{item.description}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <Box>
                            {item.dietary_details.map((detail) => (
                              <Chip size="small" sx={{marginRight: '5px'}} label={detail} />
                            ))}
                          </Box>
                          <Typography>${item.price}</Typography>
                        </Box>
                        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                          <Button variant="outlined" 
                            onClick={() => decrementQuantity(itemId)} 
                            sx={{ 
                              paddingInline: '15px', 
                              minWidth: 0 
                            }}
                          >
                            -
                          </Button>
                          <Typography variant="body1" sx={{ marginX: '10px' }}>{quantities[itemId] || 0}</Typography>
                          <Button variant="outlined" onClick={() => incrementQuantity(itemId)} 
                            sx={{ paddingInline: '15px',
                              minWidth: 0 
                            }}
                          >
                            +
                          </Button>
                          <Button variant="contained" onClick={() => addToCart(itemId)}>Add To Cart</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  )
                }
              })}
            </Box>
          </React.Fragment>
        ))}
        </Box>
      </Box>
  )
} 

export default Menu;
