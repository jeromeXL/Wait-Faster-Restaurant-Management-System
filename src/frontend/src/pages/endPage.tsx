import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import currencyFormatter from '../utils/currencyFormatter';

const EndPage = () => {

  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionParam = searchParams.get('session');
    const sessionFromParams = sessionParam ? JSON.parse(sessionParam) : null;
    setSession(sessionFromParams);
  }, [location.search]);

  // fetch menu data
  const [menu, setMenu] = useState<Menu | null>({ categories: [] });

  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});

  async function fetchMenu() {
      // fetches menu data and stores in fetched menu
      const fetchedMenu = await getMenu();
      setMenu(fetchedMenu.Menu);
      setMenuItems(fetchedMenu.Items);
  }

  useEffect(() => {
      fetchMenu().catch((err) => console.log("Failed to fetch menu", err));
  }, []);

  // get aggregate list of ordered items and quantity ordered 
  const getOrderItemCounts = (session) => {
    const itemCounts = new Map();
  
    // Iterate over each order in the session
    session.orders.forEach((order) => {
      // Iterate over each item in the order
      order.items.forEach((item) => {
        // Increment count for the menu item
        const count = itemCounts.get(item.menu_item_id) || 0;
        itemCounts.set(item.menu_item_id, count + 1);
      });
    });
  
    // Create an array containing items with counts
    const itemsWithCounts = Array.from(itemCounts.entries()).map(
      ([itemId, count]) => {
        // Find the item details from the menuItems using itemId
        const menuItem = menuItems[itemId];
        return {
          item: menuItem,
          count: count,
        };
      }
    );
  
    return itemsWithCounts;
  };

  const itemsWithCounts = getOrderItemCounts(session);

  const total = itemsWithCounts.reduce((acc, itemWithCount) => {
    const itemTotal = itemWithCount.item.price * itemWithCount.count;
    return acc + itemTotal;
  }, 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      }}
    >
      <Container
        sx={{
          textAlign: 'center',
          color: 'white',
          padding: 4,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Thank You for Eating with Us
        </Typography>
        <Typography variant="subtitle1">
          We hope you had a great experience. See you again soon!
        </Typography>
      </Container>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
            backgroundColor: "transparent",
            paddingBottom: "20px",
        }}
      >
        <Table aria-label="bill">
            <TableHead>
                <TableRow>
                    <TableCell 
                        style={{
                            fontWeight: 'bold', 
                            color: 'white' 
                        }}
                    >
                        Item
                    </TableCell>
                    <TableCell 
                        align="left" 
                        style={{ 
                            fontWeight: 'bold', 
                            color: 'white' 
                        }}
                    >
                        Price
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 'bold', color: 'white' }}>
                      Quantity
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 'bold', color: 'white' }}>
                      Subtotal
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {itemsWithCounts.map((itemWithCount) => (
                <TableRow key={itemWithCount.item.id}>
                  <TableCell component="th" scope="row" style={{ fontWeight: 'bold', color: 'white'}}>
                    {itemWithCount.item.menu_item_name}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{itemWithCount.item.price}</TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{itemWithCount.count}</TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{itemWithCount.count*itemWithCount.item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
    </TableContainer>
    <div>Total Price: {total}</div>
    </Box>
  );
};

export default EndPage;
