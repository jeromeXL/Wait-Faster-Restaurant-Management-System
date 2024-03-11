import { useState, useEffect } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Tabs } from '@mui/material';
import FloatingBottomNav from '../components/AdminBottomBar';

interface User {
  username: string;
  password: string;
  role: string;
}

const getLocalStorageData = (key: string): User[] => JSON.parse(localStorage.getItem(key) || '[]');

const setLocalStorageData = (key: string, data: User[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    setUsers(getLocalStorageData('users'));
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setLocalStorageData('users', updatedUsers);
    handleClose();
  };

  const handleEditUser = (index: number) => {
    setSelectedUser(users[index]);
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleSaveEditedUser = (editedUser: User) => {
    if (editIndex === null) return;

    const updatedUsers = [...users];
    updatedUsers[editIndex] = editedUser;
    setUsers(updatedUsers);
    setLocalStorageData('users', updatedUsers);

    setEditIndex(null);
    setEditOpen(false);
  };

  const handleDeleteUser = () => {
    if (editIndex === null) return;

    const updatedUsers = users.filter((_, index) => index !== editIndex);
    setUsers(updatedUsers);
    setLocalStorageData('users', updatedUsers);

    setEditIndex(null);
    setEditOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
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
          {users.map((user, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color='grey'>{user.username}</Typography>
              <Typography variant="body1" color='grey'>{user.role}</Typography>
              <Button variant="outlined" size="small" onClick={() => handleEditUser(index)}>Edit</Button>
            </Box>
          ))}
        </Box>
      </Container>
      <AddUserDialog open={open} onClose={handleClose} onAddUser={handleAddUser} />
      <EditUserDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={selectedUser}
        onSave={handleSaveEditedUser}
        onDelete={handleDeleteUser}
      />
      <FloatingBottomNav handleOpen={handleOpen} />
    </Box>
  );
};

const AddUserDialog = ({ open, onClose, onAddUser }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSelectedRole('');
  };

  const handleRoleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedRole(newValue);
  };

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    onAddUser({ username, password, role: selectedRole });
    clearForm();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Account</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Username" type="text" fullWidth variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField margin="dense" label="Password" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField margin="dense" label="Reconfirm Password" type="password" fullWidth variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <Tabs value={selectedRole} onChange={handleRoleChange} variant="scrollable" scrollButtons="auto" aria-label="Roles" indicatorColor="primary" textColor="primary" allowScrollButtonsMobile>
          {/* Tabs for role selection */}
        </Tabs>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditUserDialog = ({ open, onClose, user, onSave, onDelete }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    onSave({ ...user, username, password, role: selectedRole });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Username" type="text" fullWidth variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField margin="dense" label="New Password (optional)" type="password" fullWidth variant="outlined" value={password} onChange={(e) => setPassword(e.target.value)} />
        <TextField margin="dense" label="Reconfirm Password" type="password" fullWidth variant="outlined" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <Tabs value={selectedRole} onChange={(_e, newValue) => setSelectedRole(newValue)} variant="scrollable" scrollButtons="auto" aria-label="Roles" indicatorColor="primary" textColor="primary" allowScrollButtonsMobile>
          {/* Tabs for role selection */}
        </Tabs>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
        <Button color="error" onClick={() => onDelete(user)}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Admin;
