import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, X } from 'lucide-react';
import { createRole } from '../services/roleService';

const CreateRole = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const roleData = {
        name: formData.name
      };

      const response = await createRole(roleData);
      console.log('Role created successfully:', response);

      if (response.success) {
        setSuccess('Role created successfully!');

        // Reset form
        setFormData({
          name: ''
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/view-role');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create role');
      }

    } catch (err) {
      console.error('Create role error:', err);
      setError(err.response?.data?.message || 'Failed to create role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Create New Role</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#002d74] to-[#1691fd] px-6 py-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-white mr-2" />
              <h2 className="text-xl font-semibold text-white">Role Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Role Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Admin, Manager, Developer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a unique role name (e.g., project_admin, team_lead)
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <span className="font-semibold">Success:</span> {success}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center"
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#002d74] text-white rounded-lg font-medium hover:bg-[#001a4d] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Role
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;