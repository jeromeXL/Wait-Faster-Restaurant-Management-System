import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  useMediaQuery,
  Divider,
  List,
  ListItemButton,
  Modal,
  ListItem,
} from "@mui/material";
import { getAxios } from "../utils/useAxios";
import KitchenBottomBar from "../components/KitchenBottomBar";
import {
  ActivityPanelUpdatedEventName,
  NotificationSocket,
} from "../utils/socketIo";

// Mock data for initial orders
const tableMock = {
  customer_orders: [
    {
      table_id: 1,
      orders: [
        {
          id: "101",
          status: 2,
          session_id: "session1",
          items: [
            {
              id: "item1",
              status: 2, // 'Ready'
              menu_item_id: "menuItem1",
              menu_item_name: "Margherita Pizza",
              is_free: false,
              preferences: [],
              additional_notes: "",
            },
            {
              id: "item2",
              status: 0, // 'Pending'
              menu_item_id: "menuItem2",
              menu_item_name: "Caesar Salad",
              is_free: false,
              preferences: ["No anchovies"],
              additional_notes: "Extra dressing on the side",
            },
          ],
        },
      ],
    },
    {
      table_id: 2,
      orders: [
        {
          id: "102",
          status: 1, // 'Ongoing'
          session_id: "session2",
          items: [
            {
              id: "item3",
              status: 1, // 'Ongoing'
              menu_item_id: "menuItem3",
              menu_item_name: "Spaghetti Carbonara",
              is_free: false,
              preferences: ["Less salty"],
              additional_notes: "",
            },
            {
              id: "item4",
              status: 2, // 'Ready'
              menu_item_id: "menuItem4",
              menu_item_name: "Garlic Bread",
              is_free: true,
              preferences: [],
              additional_notes: "Served warm",
            },
            {
              id: "item5",
              status: 0, // 'Pending'
              menu_item_id: "menuItem5",
              menu_item_name: "Tiramisu",
              is_free: false,
              preferences: ["No cocoa powder"],
              additional_notes: "Birthday message on the plate",
            },
          ],
        },
      ],
    },
  ],
};

interface OrderItem {
  id: string;
  status: ItemStatus;
  menu_item_id: string;
  menu_item_name: string;
  is_free: boolean;
  preferences: string[];
  additional_notes: string;
}

interface Order {
  id: string;
  status: ItemStatus;
  session_id: string;
  items: OrderItem[];
}

interface CustomerOrder {
  table_id: number;
  orders: Order[];
}

enum ItemStatus {
  Pending = 0, // ORDERED <-> PENDING
  Preparing = 1, // PREPARING <-> ONGOING,
  Ready = 2, // COMPLETE <-> READY
}

const Kitchen = () => {
  const [tables, setTables] = useState<CustomerOrder[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date().toLocaleString()
  );

  const cardStyles = {
    bgcolor: "#e3f2fd",
    m: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%"
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);
    if (!NotificationSocket.connected) {
      NotificationSocket.connect();
    }

    NotificationSocket.on(ActivityPanelUpdatedEventName, fetchOrders);

    return () => {
      NotificationSocket.disconnect();
      NotificationSocket.removeListener(ActivityPanelUpdatedEventName);
      clearInterval(interval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getAxios().get(
        "/orders?statuses=0&statuses=1&statuses=2"
      );
      setTables(response.data.customer_orders);
      //setTables(tableMock.customer_orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const translateStatus = (status: ItemStatus): string => {
    switch (status) {
      case ItemStatus.Pending:
        return "Ordered";
      case ItemStatus.Preparing:
        return "Preparing";
      case ItemStatus.Ready:
        return "Ready";
      default:
        return "Done";
    }
  };

  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.Ready:
        return "green";
      case ItemStatus.Preparing:
        return "orange";
      case ItemStatus.Pending:
        return "#1976D2";
      default:
        return "grey";
    }
  };

  // Update individual item status in an order
  const updateItemStatus = async (newStatus: ItemStatus) => {
    if (!selectedInfo) return;

    try {
      await getAxios().post(
        `/order/${selectedInfo.orderId}/${selectedInfo.itemId}`,
        {
          status: newStatus,
        }
      );

      fetchOrders();
      closeModal();
    } catch (error) {
      console.error("Failed to update item status:", error);
    }
  };

  const handleItemClick = (
    tableId: number,
    orderId: string,
    itemId: string
  ) => {
    setSelectedInfo({ tableId, orderId, itemId });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInfo(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#121212", padding: "20px", color: "#E0E0E0", background: `linear-gradient(to bottom right, #121212, #2C2C2C)` }}>
      <Box
        sx={{
          mb: 4,
          textAlign: isMobile ? "center" : "left",
          bgcolor: "transparent",
        }}
      >
        <Typography variant={isMobile ? "h6" : "h4"} gutterBottom>
          Admin - Kitchen
        </Typography>
        <Typography
          variant={isMobile ? "subtitle2" : "subtitle1"}
          gutterBottom
        >
          Ongoing Orders
        </Typography>
      </Box>
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: "8px",
          boxShadow: 3,
          p: isMobile ? 1 : 2,
          mb: 2,
        }}
      >
        <Typography
          variant="body1"
          gutterBottom
          sx={{ color: "black", fontWeight: 'bold' }}
        >
          When you cook under pressure you trade perfection - Gordon
          Ramsay
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "black" }}
        >
          {currentDateTime}
        </Typography>
        <Divider sx={{ mb: "10px" }} />
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            p: isMobile ? 1 : 2,
            mb: 2,
          }}
        >

          <Grid container spacing={2} sx = {{mb: '20px'}} justifyContent={isMobile ? "center" : "flex-start"}>
            {tables.map((table) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={table.table_id}>
                <Card raised sx={cardStyles}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Table {table.table_id}</Typography>
                    {table.orders.map((order, orderIndex) => (
                      <Box key={order.id} sx={{ mb: 2 }}>
                        <Divider sx={{ bgcolor: 'grey', height: '1px', mt: '15px', mb: '10px' }} />
                        <Typography variant="body2" gutterBottom sx = {{fontWeight: 'bold'}}>Order {orderIndex + 1}</Typography>
                        <List dense>
                          {order.items.map((item) => (
                            <ListItem key={item.id} disablePadding>
                              <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                  justifyContent: "space-between",
                                  my: 0.5,
                                  borderColor: getStatusColor(item.status),
                                  color: getStatusColor(item.status),
                                  borderRadius: '10px',
                                  borderWidth: '2px',
                                  borderStyle: 'solid',
                                }}
                                onClick={() => handleItemClick(table.table_id, order.id, item.id)}
                              >
                                {item.menu_item_name}
                                <span>{translateStatus(item.status)}</span>
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                        {order.items.some(item => item.additional_notes) && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Special Instructions:</Typography>
                            {order.items.map((item, index) => item.additional_notes && (
                              <Typography key={index} variant="body1" color="textSecondary" sx={{ fontStyle: "italic" }}>
                                {item.additional_notes}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      <Modal
        open={modalOpen}
        onClose={closeModal}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "calc(100% - 32px)",
          width: 400,
          border: "2px solid #000",
          bgcolor: "#d3eaf2",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          margin: "10px",
          "&:focus-visible": {
            outline: "none",
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button onClick={closeModal} sx={{ minWidth: 'auto', color: 'gray' }}>
              ❌
            </Button>
          </Box>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            textAlign="center"
            marginBottom={2}
          >
            Select New Status
          </Typography>
          <List>
            {selectedInfo &&
              tables.length > 0 &&
              (function () {
                // Find the current status of the selected item
                const currentItem = tables
                  .find(
                    (table) =>
                      table.table_id ===
                      selectedInfo.tableId
                  )
                  ?.orders.find(
                    (order) =>
                      order.id === selectedInfo.orderId
                  )
                  ?.items.find(
                    (item) =>
                      item.id === selectedInfo.itemId
                  );

                const currentStatus = currentItem
                  ? currentItem.status
                  : null;

                // Determine which button(s) to display based on the current status
                switch (currentStatus) {
                  case ItemStatus.Pending:
                    return (
                      <ListItemButton
                        onClick={() =>
                          updateItemStatus(
                            ItemStatus.Preparing
                          )
                        }
                        sx={{
                          justifyContent: "center",
                          bgcolor: getStatusColor(
                            ItemStatus.Preparing
                          ),
                          margin: "25px",
                          borderRadius: "20px",
                          padding: "10px 20px",
                          "&:hover": {
                            bgcolor: `${getStatusColor(
                              ItemStatus.Preparing
                            )}`,
                          },
                        }}
                      >
                        Preparing
                      </ListItemButton>
                    );
                  case ItemStatus.Preparing:
                    return (
                      <>
                        <ListItemButton
                          onClick={() =>
                            updateItemStatus(
                              ItemStatus.Ready
                            )
                          }
                          sx={{
                            justifyContent:
                              "center",
                            bgcolor: getStatusColor(
                              ItemStatus.Ready
                            ),
                            margin: "25px",
                            borderRadius: "20px",
                            padding: "10px 20px",
                            "&:hover": {
                              bgcolor: `${getStatusColor(
                                ItemStatus.Ready
                              )}`,
                            },
                          }}
                        >
                          Ready
                        </ListItemButton>
                        <ListItemButton
                          onClick={() =>
                            updateItemStatus(
                              ItemStatus.Pending
                            )
                          }
                          sx={{
                            justifyContent:
                              "center",
                            bgcolor: getStatusColor(
                              ItemStatus.Pending
                            ),
                            margin: "25px",
                            borderRadius: "20px",
                            padding: "10px 20px",
                            "&:hover": {
                              bgcolor: `${getStatusColor(
                                ItemStatus.Pending
                              )}`,
                            },
                          }}
                        >
                          Pending
                        </ListItemButton>
                      </>
                    );
                  case ItemStatus.Ready:
                    // If moving back to Preparing from Ready is intended
                    return (
                      <ListItemButton
                        onClick={() =>
                          updateItemStatus(
                            ItemStatus.Preparing
                          )
                        }
                        sx={{
                          justifyContent: "center",
                          bgcolor: getStatusColor(
                            ItemStatus.Preparing
                          ),
                          margin: "25px",
                          borderRadius: "20px",
                          padding: "10px 20px",
                          "&:hover": {
                            bgcolor: `${getStatusColor(
                              ItemStatus.Preparing
                            )}`,
                          },
                        }}
                      >
                        Preparing
                      </ListItemButton>
                    );
                  default:
                    return null;
                }
              })()}
          </List>
        </Box>
      </Modal>
      <KitchenBottomBar refreshOrders={fetchOrders} />
    </Box>
  );
};

export default Kitchen;
