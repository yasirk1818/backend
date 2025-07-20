import React, { useState, useEffect } from 'react';
import axios from 'axios'; // API calls ke liye
import UserTable from '../components/UserTable';

const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                const { data } = await axios.get('/api/admin/users', config);
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch users. You might not be an admin.');
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // block/delete functions yahan banayein jo API call karein

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Admin - User Management</h1>
            <UserTable users={users} />
        </div>
    );
};

export default AdminDashboardPage;
