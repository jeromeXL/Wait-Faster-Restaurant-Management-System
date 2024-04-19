import { useState, useEffect, useMemo } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Tabs, Snackbar, Alert, Tab, Divider, Grid, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import FloatingBottomNav from '../components/AdminBottomBar';
import { getAxios } from '../utils/useAxios';
import { UserRole } from "../utils/user";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface User {
  userId: string;
  username: string;
  password: string;
  role: UserRole;
}

interface UserRoleStatsProps {
  users: User[];
}

const styles = {
  adminBox: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    padding: 2,
    alignItems: 'center',
    bgcolor: '#1e1e1e',
    paddingTop: '20px',
    color: '#E0E0E0',
    background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a1e35, #0f0c33)',
  },
  container: {
    bgcolor: 'background.paper',
    borderRadius: 2,
    padding: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    mb: '80px',
    width: '100%',
    maxWidth: '600px',
  },
  userBox: {
    display: 'flex',
    justifyContent: 'space-between',
    bgcolor: 'transparent',
    padding: 2,
    alignItems: 'center',
  },
  gridItem: {
    color: 'grey',
    textAlign: 'center',
    width: '100%',
  },
  button: {
    textTransform: 'none',
    margin: '8px',
  },
  dialog: {
    minWidth: '100%',
    maxWidth: '600px',
  },
  tabLabel: {
    textTransform: 'capitalize',
  },
  statsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 2,
    marginTop: 2,
    padding: 2,
    borderRadius: '8px',
    backgroundColor: '#404040',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
    '@media (max-width:1092px)': {
      flexDirection: 'column',
      gap: "10px"
    }
  },
  statItem: {
    color: '#FFF',
    textAlign: 'center',
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#555',
    margin: '0 10px',
    flex: 1,
    '@media (max-width:600px)': {
      margin: '10px 0',
    }
  },
  headerItem: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    padding: '0 30px',
  }
};


// Helper functions
function getUserRoleEntries() {
  return Object.entries(UserRole).filter(([key]) => isNaN(Number(key)));
}

function roleName(role: UserRole): string {
  switch (role) {
    case UserRole.USER_ADMIN:
      return 'Admin';
    case UserRole.MANAGER:
      return 'Manager';
    case UserRole.WAIT_STAFF:
      return 'Wait Staff';
    case UserRole.KITCHEN_STAFF:
      return 'Kitchen Staff';
    case UserRole.CUSTOMER_TABLET:
      return 'Customer Tablet';
    default:
      return 'Unknown Role';
  }
}

const UserRoleStats = ({ users }: UserRoleStatsProps) => {
  const roleCounts = useMemo(() => {
    const counts: Partial<Record<UserRole, number>> = {};

    users.forEach(user => {
      const role = user.role;
      if (role in counts) {
        counts[role]! += 1;
      } else {
        counts[role] = 1;
      }
    });
    return counts;
  }, [users]);

  return (
    <Box sx={styles.statsContainer}>
      {getUserRoleEntries().map(([role, value]) => (
        <Typography key={role} sx={styles.statItem}>
          {roleName(value as UserRole)}: {roleCounts[value as UserRole] || 0}
        </Typography>
      ))}
    </Box>
  );
};

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | UserRole>('All');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAxios().get('/users');
        const mappedUsers = response.data.map((user: { role: UserRole; }) => ({
          ...user,
          role: user.role as UserRole
        }));
        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };

  const filteredUsers = users.filter(user => roleFilter === 'All' ? true : user.role === roleFilter as UserRole);

  const handleAddUser = async (newUser: User) => {
    try {
      const response = await getAxios().post('/user/create', newUser);
      setUsers([...users, response.data]);
      handleClose();
    } catch (error) {
      setSnackbarMessage("Failed to create user, please ensure all required information is correctly formatted.");
      setSnackbarOpen(true);
      console.error("Failed to create user:", error);
    }
  };

  const handleEditUser = (index: number) => {
    setSelectedUser(users[index]);
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleSaveEditedUser = async (editedUser: User) => {
    if (editIndex === null) return;
    const payload = {
      userId: editedUser.userId,
      username: editedUser.username,
      password: editedUser.password ? editedUser.password : null,
      role: editedUser.role,
    };

    try {
      console.log(payload);
      const response = await getAxios().put(`/user/update/${editedUser.userId}`, payload);
      const updatedUsers = [...users];
      updatedUsers[editIndex] = response.data;
      setUsers(updatedUsers);
      setEditIndex(null);
      setEditOpen(false);
    } catch (error) {
      setSnackbarMessage("Failed to update user, please ensure all required information is correctly formatted.");
      setSnackbarOpen(true);
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    try {
      await getAxios().delete(`/user/delete/${userToDelete.userId}`);
      const updatedUsers = users.filter((user) => user.userId !== userToDelete.userId);
      setUsers(updatedUsers);
      setEditIndex(null);
      setEditOpen(false);
    } catch (error) {
      setSnackbarMessage("Failed to delete user, please try again later.")
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <Box sx={styles.adminBox}>
      <Typography variant="h4" gutterBottom sx={{ color: '#FFF' }}>
        <AccountCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Admin Dashboard
      </Typography>
      <UserRoleStats users={users} />
      <Box sx={{ minWidth: 120, marginBottom: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="role-filter-label" sx={{ color: 'white' }}>Role Filter</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter.toString()}
            label="Role Filter"
            onChange={handleRoleFilterChange}
            sx={{
              color: "white",
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: "white",
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: "white",
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: "white",
              },
              '.MuiSvgIcon-root ': {
                fill: "white",
              },
            }}
          >
            <MenuItem value="All">All</MenuItem>
            {getUserRoleEntries().map(([key, value]) => (
              <MenuItem key={key} value={value}>{roleName(value as UserRole)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Container maxWidth="sm" sx={styles.container}>
        <Box sx={styles.userBox}>
          <Typography variant="body1" sx={styles.headerItem}><PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />User</Typography>
          <Typography variant="body1" sx={styles.headerItem}><AdminPanelSettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Role</Typography>
          <Typography variant="body1" sx={styles.headerItem}><EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Edit</Typography>
        </Box>
        <Divider />
        {filteredUsers.map((user, index) => (
          <Grid key={index} container alignItems="center" justifyContent="space-between">
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1" sx={styles.gridItem}>{user.username}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body1" sx={styles.gridItem}>{roleName(user.role)}</Typography>
            </Grid>
            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} sx={styles.button} onClick={() => handleEditUser(index)}>Edit</Button>
            </Grid>
          </Grid>
        ))}
      </Container>
      <AddUserDialog open={open} onClose={handleClose} onAddUser={handleAddUser} />
      {selectedUser && (
        <EditUserDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={selectedUser}
          onSave={handleSaveEditedUser}
          onDelete={handleDeleteUser}
        />
      )}
      <FloatingBottomNav handleOpen={handleOpen} />
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const AddUserDialog = ({ open, onClose, onAddUser }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<number>(UserRole.MANAGER);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRole(2);
  };

  const handleRoleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedRole(newValue);
  };

  const handleSubmit = () => {
    if (!username || !password || !confirmPassword || !selectedRole) {
      setSnackbarMessage('All fields are required');
      setSnackbarOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords don't match");
      setSnackbarOpen(true);
      return;
    }

    onAddUser({ username, password, role: Number(selectedRole) });
    clearForm();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Username" type="text" fullWidth variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="dense" label="Password" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField margin="dense" label="Reconfirm Password" type="password" fullWidth variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Tabs value={selectedRole} onChange={handleRoleChange} variant="scrollable" scrollButtons="auto" aria-label="Roles" indicatorColor="primary" textColor="primary" allowScrollButtonsMobile>
            {getUserRoleEntries().map(([role, value]) => (
              <Tab key={value} label={role.replace('_', ' ')} value={value} />
            ))}
          </Tabs>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

const EditUserDialog = ({ open, onClose, user, onSave, onDelete }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = () => {
    if (!username || !selectedRole) {
      setSnackbarMessage('Username and role are required');
      setSnackbarOpen(true);
      return;
    }

    if (password && password !== confirmPassword) {
      setSnackbarMessage("Passwords don't match");
      setSnackbarOpen(true);
      return;
    }

    onSave({ ...user, username, password: password ? password : user.password, role: selectedRole });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Username" type="text" fullWidth variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField margin="dense" label="New Password (optional)" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField margin="dense" label="Reconfirm Password" type="password" fullWidth variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {user?.role !== UserRole.USER_ADMIN && (
            <Tabs value={selectedRole} onChange={(_e, newValue) => setSelectedRole(newValue)} variant="scrollable" scrollButtons="auto" aria-label="Roles" indicatorColor="primary" textColor="primary" allowScrollButtonsMobile>
              {getUserRoleEntries().map(([role, value]) => (
                <Tab key={value} label={role.replace('_', ' ')} value={value} />
              ))}
            </Tabs>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
          {user?.role !== UserRole.USER_ADMIN && (
            <Button color="error" onClick={() => onDelete(user)}>Delete</Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Admin;
