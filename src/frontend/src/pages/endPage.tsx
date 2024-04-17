import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { SessionResponse, getMenu, getSession } from '../utils/api';
import { MenuItem } from '../utils/menu';
import { AssistanceRequestUpdatedEventName, NotificationSocket } from '../utils/socketIo';
import currencyFormatter from '../utils/currencyFormatter';

const EndPage = () => {
  
  const [session, setSession] = useState<SessionResponse>();

  async function fetchTableSession() {
      await getSession().then(setSession);
  }

  useEffect(() => {
      fetchTableSession()
          .catch((err) => console.log("Failed to fetch session", err))
          .then(() => {
              if (!NotificationSocket.connected) {
                  NotificationSocket.connect();
              }

              NotificationSocket.on(
                  AssistanceRequestUpdatedEventName,
                  async (data) => {
                      console.log("HERE!!");
                      if (data.id == session?.id) {
                          await fetchTableSession();
                      }
                  }
              );
          });

      return () => {
          NotificationSocket.disconnect();
          NotificationSocket.removeListener(
              AssistanceRequestUpdatedEventName
          );
      };
  }, []);

  // fetch menu items 
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});

  async function fetchMenu() {
      // fetches menu data and stores in fetched menu
      const fetchedMenu = await getMenu();
      setMenuItems(fetchedMenu.Items);
  }

  useEffect(() => {
      fetchMenu().catch((err) => console.log("Failed to fetch menu items", err));
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

  const itemsWithCounts = session ? getOrderItemCounts(session) : [];

  const total = itemsWithCounts.reduce((acc, itemWithCount) => {
    const itemTotal = itemWithCount.item.price * itemWithCount.count;
    return acc + itemTotal;
  }, 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, hsla(276, 5%, 22%, 1) 0%, hsla(242, 23%, 40%, 1) 48%, hsla(255, 21%, 59%, 1) 100%)',
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
            paddingX: "200px",
            paddingY: "20px"
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
                        align="right" 
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
                    {itemWithCount.item.name}
                  </TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{currencyFormatter.format(itemWithCount.item.price)}</TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{itemWithCount.count}</TableCell>
                  <TableCell align="right" style={{ color: 'white'}}>{currencyFormatter.format(itemWithCount.count*itemWithCount.item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
    </TableContainer>
    <div style={{ color: 'white', fontWeight: 'bold' }}>Bill Total: {currencyFormatter.format(total)}</div>
    </Box>
  );
};

export default EndPage;
