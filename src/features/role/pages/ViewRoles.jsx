import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Trash2, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { getAllRoles, deleteRole } from '../services/roleService';

const ViewRoles = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getAllRoles();

            console.log('API Response:', response);

            if (response && response.success) {
                const rolesData = Array.isArray(response.data) ? response.data : [];
                setRoles(rolesData);
            } else {
                setRoles([]);
                // Don't show error for empty list
                if (response?.message && response.message !== "Failed to fetch roles") {
                    setError(response.message);
                }
            }
        } catch (err) {
            console.error('Fetch roles error:', err);
            // Don't show error if it's just an empty list
            if (err.response?.status !== 401) {
                setError('Error loading roles');
            }
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (role) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedRole) return;

        try {
            await deleteRole(selectedRole.id);
            setRoles(prevRoles => prevRoles.filter(r => r.id !== selectedRole.id));
            setShowDeleteModal(false);
            setSelectedRole(null);
        } catch (err) {
            setError('Failed to delete role');
            console.error(err);
        }
    };

    const filteredRoles = roles.filter(role => {
        const searchLower = searchTerm.toLowerCase();
        return (
            role.name?.toLowerCase().includes(searchLower)
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
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Role Management</h1>
                            <p className="text-gray-600 mt-1">View and manage all roles</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/role')}
                        className="flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Role
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Roles</p>
                                <p className="text-2xl font-bold text-[#002d74]">{roles.length}</p>
                            </div>
                            <Shield className="w-8 h-8 text-[#1691fd]" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Roles</p>
                                <p className="text-2xl font-bold text-green-600">{roles.length}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                            placeholder="Search by role name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#002d74] border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={fetchRoles}
                                className="mt-4 px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d]"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredRoles.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No roles found</p>
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
                                            Role Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRoles.map((role, index) => (
                                        <tr key={role.id || index} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-[#002d74] text-white flex items-center justify-center font-semibold">
                                                            {role.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {role.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                #{role.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDeleteClick(role)}
                                                        className="text-red-600 hover:text-red-900 transition"
                                                        title="Delete Role"
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
            {showDeleteModal && selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete role <strong>{selectedRole.name}</strong>? This action cannot be undone.
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

export default ViewRoles;