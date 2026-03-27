// src/features/thread/pages/EditThread.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, updateThread } from '../service/threadService';
import { getAllUsers } from '../../project/services/userService';
import { ArrowLeft, Calendar, User, AlertCircle, Save, Loader, X } from 'lucide-react';

const EditThread = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    priority: 3,
    assignUserId: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchThreadAndUsers();
  }, [threadId]);

  const fetchThreadAndUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch thread details
      const threadResponse = await getThreadById(threadId);
      console.log("Thread data:", threadResponse);
      
      // Fetch users
      const usersResponse = await getAllUsers();
      
      if (usersResponse && usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
      
      if (threadResponse && threadResponse.success) {
        const thread = threadResponse.data;
        setFormData({
          topic: thread.topic || '',
          description: thread.description || '',
          priority: thread.priority || 3,
          assignUserId: thread.assignUserId?.toString() || '',
          dueDate: thread.dueDate ? thread.dueDate.split('T')[0] : ''
        });
      } else {
        setError("Thread not found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load thread data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.topic.trim()) {
      setError('Topic is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.assignUserId) {
      setError('Please assign a user');
      return false;
    }
    if (!formData.dueDate) {
      setError('Please select a due date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError('');
    
    try {
      const threadData = {
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        priority: parseInt(formData.priority),
        assignUserId: parseInt(formData.assignUserId),
        dueDate: formData.dueDate
      };
      
      console.log("Updating thread with data:", threadData);
      
      const response = await updateThread(threadId, threadData);
      console.log("Thread updated:", response);
      
      if (response && response.success) {
        navigate(`/thread/${threadId}`);
      } else {
        setError(response?.message || 'Failed to update thread');
      }
    } catch (err) {
      console.error("Error updating thread:", err);
      setError(err.response?.data?.message || 'Failed to update thread. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  const priorityOptions = [
    { value: 1, label: 'Low', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 2, label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 3, label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
    { value: 4, label: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin rounded-full h-12 w-12 text-[#002d74] mx-auto mb-4" />
          <p className="text-gray-600">Loading thread details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => navigate(`/thread/${threadId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Edit Thread</h1>
            <p className="text-sm text-gray-500 mt-1">Update thread information</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#002d74] to-[#1691fd] px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Thread Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Topic */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Payment API bug, UI issue, Database error"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
                disabled={saving}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe the issue or discussion in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition resize-y"
                disabled={saving}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {priorityOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => !saving && setFormData(prev => ({ ...prev, priority: option.value }))}
                    className={`
                      flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all
                      ${formData.priority === option.value 
                        ? `${option.bg} ${option.color} border-[#002d74] shadow-md` 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }
                      ${saving ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign User */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Assign To <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="assignUserId"
                  value={formData.assignUserId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition bg-white"
                  disabled={saving}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(`/thread/${threadId}`)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-2 bg-[#002d74] text-white rounded-lg font-medium hover:bg-[#001a4d] transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Thread
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

export default EditThread;