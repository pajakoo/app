import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css'; // Assuming you will add the new CSS below

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    // Fetch users and their roles from your server when the component mounts
    axios.get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => {
        setUsers(response.data);
        const initialSelectedRoles = {};
        response.data.forEach((user) => {
          initialSelectedRoles[user._id] = user.roles;
        });
        setSelectedRoles(initialSelectedRoles);
      })
      .catch((error) => console.error('Error fetching users:', error));

    // Fetch user roles
    axios.get(`${process.env.REACT_APP_API_URL}/api/userRoles`)
      .then((response) => setRoles(response.data))
      .catch((error) => console.error('Error fetching user roles:', error));
  }, []);

  const handleEditRoles = async (userId) => {
    try {
      const updatedRoles = selectedRoles[userId] || [];
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}/roles`, { roles: updatedRoles });
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  };

  // New: Delete user handler
  const handleDeleteUser = async (userId) => {
    try {
      // Call the delete API
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/${userId}`);

      // Update the users state to remove the deleted user
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRoleChange = (userId, event) => {
    const updatedRoles = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedRoles((prevSelectedRoles) => ({ ...prevSelectedRoles, [userId]: updatedRoles }));
  };

  return (
    <section className="user-management">
      <h4 className="section-title">Users</h4>
      <div className="users-container">
        {users && users.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <div className="user-roles">
              {roles && (
                <select
                  className="role-select"
                  multiple
                  value={selectedRoles[user._id] || []}
                  onChange={(e) => handleRoleChange(user._id, e)}
                >
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="user-actions">
              <button
                className="edit-button"
                onClick={() => handleEditRoles(user._id)}
              >
                Edit Roles
              </button>
              <button
                className="delete-user-button"
                onClick={() => handleDeleteUser(user._id)}
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserManagement;
