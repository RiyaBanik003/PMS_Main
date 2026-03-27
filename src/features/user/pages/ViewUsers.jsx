import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2, Eye, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { getAllUsers } from '../../project/services/userService';
const ViewUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []); // Empty dependency array - runs only once

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors
            const response = await getAllUsers();

            console.log('API Response:', response); // Debug log

            if (response && response.success) {
                // Ensure response.data is an array
                const usersData = Array.isArray(response.data) ? response.data : [];
                setUsers(usersData);
            } else {
                setError(response?.message || 'Failed to fetch users');
                setUsers([]);
            }
        } catch (err) {
            console.error('Fetch users error:', err);
            setError(err.response?.data?.message || 'Error loading users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            // Call your delete API here
            // await deleteUser(selectedUser.id);

            // Remove from local state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError('Failed to delete user');
            console.error(err);
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition mr-4"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Users Management</h1>
                            <p className="text-gray-600 mt-1">View and manage all registered users</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/user')}
                        className="flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create User
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-[#002d74]">{users.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-[#1691fd]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Users</p>
                                <p className="text-2xl font-bold text-green-600">{users.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Recent Added</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {users.length > 0 ? 1 : 0}
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 text-sm">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#002d74] border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={fetchUsers}
                                className="mt-4 px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d]"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No users found</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-[#002d74] hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user.id || index} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-[#002d74] text-white flex items-center justify-center font-semibold">
                                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {user.role || 'User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/users/${user.id}`)}
                                                        className="text-blue-600 hover:text-blue-900 transition"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/users/edit/${user.id}`)}
                                                        className="text-green-600 hover:text-green-900 transition"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="text-red-600 hover:text-red-900 transition"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewUsers;