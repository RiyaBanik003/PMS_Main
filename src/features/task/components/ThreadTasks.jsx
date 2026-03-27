import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasksByThreadId, updateTask, deleteTask } from '../../../services/taskService';
import { 
  Plus, 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  GitBranch,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Loader
} from 'lucide-react';

const ThreadTasks = ({ threadId }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (threadId) {
      fetchTasks();
    }
  }, [threadId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasksByThreadId(threadId);
      console.log("Tasks response:", response);
      
      if (response && response.success) {
        const tasksData = response.data?.data || response.data || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    let newStatus;
    switch(currentStatus) {
      case 'TODO':
        newStatus = 'IN_PROGRESS';
        break;
      case 'IN_PROGRESS':
        newStatus = 'DONE';
        break;
      case 'DONE':
        newStatus = 'DONE';
        break;
      case 'BLOCKED':
        newStatus = 'IN_PROGRESS';
        break;
      default:
        newStatus = 'IN_PROGRESS';
    }
    
    try {
      setUpdatingTaskId(taskId);
      const task = tasks.find(t => t.id === taskId);
      const response = await updateTask(taskId, {
        ...task,
        taskStatus: newStatus
      });
      
      if (response && response.success) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, taskStatus: newStatus } : t
        ));
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setUpdatingTaskId(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
      case 'TODO':
        return { label: 'To Do', color: 'bg-gray-100 text-gray-700', icon: '📋', bgHover: 'hover:bg-gray-200' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: '⚡', bgHover: 'hover:bg-blue-200' };
      case 'DONE':
        return { label: 'Done', color: 'bg-green-100 text-green-700', icon: '✅', bgHover: 'hover:bg-green-200' };
      case 'BLOCKED':
        return { label: 'Blocked', color: 'bg-red-100 text-red-700', icon: '🔴', bgHover: 'hover:bg-red-200' };
      default:
        return { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700', icon: '📌', bgHover: 'hover:bg-gray-200' };
    }
  };

  const getNextStatus = (status) => {
    switch(status?.toUpperCase()) {
      case 'TODO': return 'Start Progress';
      case 'IN_PROGRESS': return 'Mark Done';
      case 'DONE': return 'Completed';
      case 'BLOCKED': return 'Unblock';
      default: return 'Update Status';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="animate-spin rounded-full h-8 w-8 text-[#002d74] mx-auto mb-3" />
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
        <button
          onClick={() => navigate(`/thread/${threadId}/create-task`)}
          className="inline-flex items-center px-3 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">No Tasks Yet</h4>
          <p className="text-gray-500 mb-4">Create tasks to track work for this thread</p>
          <button
            onClick={() => navigate(`/thread/${threadId}/create-task`)}
            className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const status = getStatusBadge(task.taskStatus);
            return (
              <div
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="text-base font-semibold text-[#002d74]">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Target: {formatDate(task.targetDate)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Created: {formatDate(task.createdAt)}
                      </span>
                      {task.gitLink && (
                        <a
                          href={task.gitLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <GitBranch className="w-3 h-3 mr-1" />
                          View PR/Commit
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {task.taskStatus !== 'DONE' && (
                      <button
                        onClick={() => handleStatusUpdate(task.id, task.taskStatus)}
                        disabled={updatingTaskId === task.id}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${status.bgHover} text-gray-600`}
                        title={getNextStatus(task.taskStatus)}
                      >
                        {updatingTaskId === task.id ? (
                          <Loader className="animate-spin h-3 w-3" />
                        ) : (
                          getNextStatus(task.taskStatus)
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition text-red-500"
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
                      <Loader className="animate-spin h-4 w-4 mr-2" />
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

export default ThreadTasks;