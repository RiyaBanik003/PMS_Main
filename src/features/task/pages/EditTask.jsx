// src/features/task/pages/EditTask.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask } from '../service/taskService';
import { ArrowLeft, Calendar, GitBranch, AlertCircle, Save, Loader } from 'lucide-react';

const EditTask = () => {
  const { threadId, taskId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gitLink: '',
    targetDate: '',
    taskStatus: 'TODO'
  });

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await getTaskById(taskId);
      console.log("Task data:", response);
      
      if (response && response.success) {
        const task = response.data;
        setFormData({
          title: task.title || '',
          description: task.description || '',
          gitLink: task.gitLink || '',
          targetDate: task.targetDate ? task.targetDate.split('T')[0] : '',
          taskStatus: task.taskStatus || 'TODO'
        });
      } else {
        setError("Task not found");
      }
    } catch (err) {
      console.error("Error fetching task:", err);
      setError("Failed to load task data");
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
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.targetDate) {
      setError('Target date is required');
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
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        gitLink: formData.gitLink.trim() || null,
        targetDate: formData.targetDate,
        taskStatus: formData.taskStatus
      };
      
      console.log("Updating task with data:", taskData);
      
      const response = await updateTask(taskId, taskData);
      console.log("Task updated:", response);
      
      if (response && response.success) {
        navigate(`/thread/${threadId}`);
      } else {
        setError(response?.message || 'Failed to update task');
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.message || 'Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  
  const statusOptions = [
    { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-700' },
    { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-700' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin rounded-full h-12 w-12 text-[#002d74] mx-auto mb-4" />
          <p className="text-gray-600">Loading task details...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Edit Task</h1>
            <p className="text-sm text-gray-500 mt-1">Update task information</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#002d74] to-[#1691fd] px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Task Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Implement payment gateway, Fix login bug"
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
                rows="4"
                placeholder="Describe the task in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition resize-y"
                disabled={saving}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="taskStatus"
                value={formData.taskStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition bg-white"
                disabled={saving}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Git Link */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Git Link <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  name="gitLink"
                  value={formData.gitLink}
                  onChange={handleChange}
                  placeholder="https://github.com/username/repo/pull/123"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Target Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
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
                    Update Task
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

export default EditTask;