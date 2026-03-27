import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask } from '../service/taskService';
import { ArrowLeft, Calendar, GitBranch, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';

const CreateTask = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gitLink: '',
    targetDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setError('Task title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Task description is required');
      return false;
    }
    if (!formData.targetDate) {
      setError('Target date is required');
      return false;
    }
    
    // Validate GitHub/GitLab link format if provided
    if (formData.gitLink && !formData.gitLink.match(/^(https?:\/\/)?(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/.*/i)) {
      setError('Please enter a valid GitHub/GitLab/Bitbucket URL');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        gitLink: formData.gitLink.trim() || null,
        targetDate: formData.targetDate
      };
      
      console.log("Creating task with data:", taskData);
      
      const response = await createTask(threadId, taskData);
      console.log("Task created:", response);
      
      if (response && response.success) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          gitLink: '',
          targetDate: ''
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/thread/${threadId}`);
        }, 2000);
      } else {
        setError(response?.message || 'Failed to create task');
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Task Created!</h2>
          <p className="text-gray-600 mb-4">Your task has been successfully created.</p>
          <p className="text-sm text-gray-500">Redirecting to thread...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/thread/${threadId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Create New Task</h1>
              <p className="text-sm text-gray-500 mt-1">Thread ID: #{threadId}</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#002d74] to-[#1691fd] px-6 py-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Task Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Investigate payment API logs, Fix authentication bug"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe the task in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition resize-y"
                disabled={loading}
              />
            </div>

            {/* Git/PR Link */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Git/PR Link <span className="text-gray-400 text-xs">(Optional)</span>
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
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Link to GitHub/GitLab PR, commit, or issue
              </p>
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
                  disabled={loading}
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
                className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2 bg-[#002d74] text-white rounded-lg font-medium hover:bg-[#001a4d] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            About Tasks
          </h3>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Tasks help break down threads into actionable items</li>
            <li>Each task can be linked to a GitHub/GitLab PR for tracking</li>
            <li>Set a target date to track deadlines for task completion</li>
            <li>Tasks will appear in the thread details page</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;