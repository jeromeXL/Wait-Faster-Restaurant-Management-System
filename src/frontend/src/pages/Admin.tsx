import { useState, useEffect } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Tabs, Snackbar, Alert, Tab, Divider } from '@mui/material';
import FloatingBottomNav from '../components/AdminBottomBar';
import { getAxios } from '../utils/useAxios';
import { UserRole } from "../utils/models/user";

interface User {
  userId: string;
  username: string;
  password: string;
  role: UserRole;
}

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

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  const handleAddUser = async (newUser: User) => {
    try {
      const response = await getAxios().post('/user/create', newUser);
      setUsers([...users, response.data]);
      handleClose();
    } catch (error) {
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
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        padding: 2,
        alignItems: 'center',
        bgcolor: '#121212',
        paddingTop: '20px',
        color: '#E0E0E0',
        background: `linear-gradient(to bottom right, #121212, #2C2C2C)`,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: '#FFF' }}>Admin Dashboard</Typography>
      <Container maxWidth="sm" sx={{
        bgcolor: 'white',
        borderRadius: 2,
        padding: 2,
        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'transparant', padding: 1 }}>
            <Typography variant="body1" color='black'><strong>User</strong></Typography>
            <Typography variant="body1" color='black'><strong>Role</strong></Typography>
            <Typography variant="body1" color='black'><strong>Edit</strong></Typography>
          </Box>
          <Divider />
          {users.map((user, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color='grey'>{user.username}</Typography>
              <Typography variant="body1" color='grey'>{roleName(user.role)}</Typography>
              <Button variant="outlined" size="small" onClick={() => handleEditUser(index)}>Edit</Button>
            </Box>
          ))}
        </Box>
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
