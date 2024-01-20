import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => console.log(selectedRoles), [selectedRoles]);

  useEffect(() => {
    // Fetch users and their roles from your server when the component mounts
    axios.get(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => {
        setUsers(response.data);

        // Set initial values for selectedRoles based on user roles
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

      // Fetch users again to update the UI
      // fetchUsers();
    } catch (error) {
      console.error('Error updating user roles:', error);
    }
  };

  const handleRoleChange = (userId, event) => {
    const updatedRoles = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedRoles((prevSelectedRoles) => ({ ...prevSelectedRoles, [userId]: updatedRoles }));
  };


  return (
    <div>
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {roles && (
                    <select
                      className="role-select"
                      multiple
                      value={selectedRoles[user._id] || []}
                      onChange={(e) => handleRoleChange(user._id, e)}
                    >
                      {roles && roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  <button className="edit-button" onClick={() => handleEditRoles(user._id)}>
                    Edit Roles
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
