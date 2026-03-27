import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasksByThreadId, deleteTask } from '../service/taskService';
import { getAllProjects } from '../../project/services/projectService';
import { getThreadsByProjectId } from '../../thread/service/threadService';
import { 
  Search, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  GitBranch,
  X
} from 'lucide-react';

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchTerm, statusFilter, tasks]);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      
      // First, get all projects
      const projectsRes = await getAllProjects(1, 100);
      
      if (projectsRes && projectsRes.success) {
        const projects = projectsRes.data.data || [];
        
        // Fetch threads for each project
        let allTasks = [];
        
        for (const project of projects) {
          try {
            const threadsRes = await getThreadsByProjectId(project.id);
            
            if (threadsRes && threadsRes.success) {
              const threads = threadsRes.data || [];
              
              // Fetch tasks for each thread
              for (const thread of threads) {
                try {
                  const tasksRes = await getTasksByThreadId(thread.id);
                  
                  if (tasksRes && tasksRes.success) {
                    const tasksData = tasksRes.data || [];
                    tasksData.forEach(task => {
                      allTasks.push({
                        ...task,
                        projectId: project.id,
                        projectTitle: project.title,
                        threadId: thread.id,
                        threadTopic: thread.topic
                      });
                    });
                  }
                } catch (err) {
                  console.error(`Error fetching tasks for thread ${thread.id}:`, err);
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching threads for project ${project.id}:`, err);
          }
        }
        
        // Sort by created date (newest first)
        allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(allTasks);
      } else {
        setError("Failed to load tasks");
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.threadTopic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(task => task.taskStatus === statusFilter);
    }
    
    setFilteredTasks(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'TODO':
        return { label: 'To Do', color: 'bg-gray-100 text-gray-700', icon: '📋' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: '⚡' };
      case 'DONE':
        return { label: 'Done', color: 'bg-green-100 text-green-700', icon: '✅' };
      case 'BLOCKED':
        return { label: 'Blocked', color: 'bg-red-100 text-red-700', icon: '🔴' };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700', icon: '📌' };
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      setDeleting(true);
      const response = await deleteTask(taskToDelete.id);
      
      if (response && response.success) {
        // Remove task from list
        setTasks(tasks.filter(t => t.id !== taskToDelete.id));
        setShowDeleteModal(false);
        setTaskToDelete(null);
      } else {
        alert(response?.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: 'ALL', label: 'All Tasks' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
    { value: 'BLOCKED', label: 'Blocked' }
  ];

  const getStatusCount = (status) => {
    if (status === 'ALL') return tasks.length;
    return tasks.filter(t => t.taskStatus === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#002d74] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Tasks</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all tasks across projects
              </p>
            </div>
            <button
              onClick={() => navigate('/tasks/create')}
              className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statusOptions.map(option => (
            <div
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition ${
                statusFilter === option.value
                  ? 'border-[#002d74] shadow-md'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <p className="text-xs text-gray-500 uppercase">{option.label}</p>
              <p className="text-2xl font-bold text-gray-800">{getStatusCount(option.value)}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by title, description, project, or thread..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Tasks Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <button
                onClick={() => navigate('/tasks/create')}
                className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const status = getStatusBadge(task.taskStatus);
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#002d74]">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Target: {formatDate(task.targetDate)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Created: {formatDate(task.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          Thread: {task.threadTopic}
                        </span>
                        <span className="flex items-center">
                          <GitBranch className="w-3 h-3 mr-1" />
                          Project: {task.projectTitle}
                        </span>
                      </div>
                      
                      {task.gitLink && (
                        <a
                          href={task.gitLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center mt-3 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <GitBranch className="w-3 h-3 mr-1" />
                          View PR/Commit
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/tasks/${task.id}/edit`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        title="Edit Task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Task</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={deleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete task <span className="font-semibold text-gray-800">"{taskToDelete.title}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;