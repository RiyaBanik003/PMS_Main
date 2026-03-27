import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThreadById, deleteThread } from '../service/threadService';
import { getTasksByThreadId, updateTask, deleteTask } from '../../task/service/taskService';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  AlertCircle, 
  Edit, 
  Trash2, 
  X, 
  Plus,
  GitBranch,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react';

const ViewThread = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  
  const [thread, setThread] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);

  useEffect(() => {
    fetchThread();
    fetchTasks();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await getThreadById(threadId);
      console.log("Thread details:", response);
      
      if (response && response.success) {
        setThread(response.data);
      } else {
        setError("Thread not found");
      }
    } catch (err) {
      console.error("Error fetching thread:", err);
      setError("Failed to load thread");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
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
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    let newStatus;
    switch(currentStatus?.toUpperCase()) {
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

  const handleDeleteThread = async () => {
    try {
      setDeleting(true);
      const response = await deleteThread(threadId);
      
      if (response && response.success) {
        setShowDeleteModal(false);
        navigate('/threads');
      } else {
        alert(response?.message || "Failed to delete thread");
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
      alert("Failed to delete thread");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      setDeletingTask(true);
      const response = await deleteTask(taskToDelete.id);
      
      if (response && response.success) {
        setTasks(tasks.filter(t => t.id !== taskToDelete.id));
        setShowDeleteTaskModal(false);
        setTaskToDelete(null);
      } else {
        alert(response?.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task");
    } finally {
      setDeletingTask(false);
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

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 1: return { label: 'Low', color: 'bg-green-100 text-green-800' };
      case 2: return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { label: 'High', color: 'bg-orange-100 text-orange-800' };
      case 4: return { label: 'Critical', color: 'bg-red-100 text-red-800' };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
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

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thread Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The thread you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/threads')}
            className="px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
          >
            Back to Threads
          </button>
        </div>
      </div>
    );
  }

  const priority = getPriorityBadge(thread.priority);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/threads')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#002d74]">{thread.topic}</h1>
                <p className="text-sm text-gray-500">Thread ID: #{thread.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
  onClick={() => navigate(`/threads/${threadId}/edit`)} // Changed from /threads/${threadId}/edit
  className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
  title="Edit Thread"
>
  <Edit className="w-5 h-5" />
</button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                title="Delete Thread"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Thread Details Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}>
                Priority: {priority.label}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                Status: {thread.threadStatus === 1 ? 'Open' : 'Closed'}
              </span>
            </div>
            
            <p className="text-gray-700 whitespace-pre-wrap mb-6">
              {thread.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                Assigned to: User #{thread.assignUserId}
              </span>
              {thread.dueDate && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Due: {formatDate(thread.dueDate)}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Created: {formatDate(thread.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <button
  onClick={() => navigate(`/threads/${threadId}/create-task`)}
  className="inline-flex items-center px-3 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition text-sm"
>
  <Plus className="w-4 h-4 mr-1" />
  Add Task
</button>
            </div>

            {tasksLoading ? (
              <div className="text-center py-12">
                <Loader className="animate-spin rounded-full h-8 w-8 text-[#002d74] mx-auto mb-3" />
                <p className="text-gray-500">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Tasks Yet</h4>
                <p className="text-gray-500 mb-4">Create tasks to track work for this thread</p>
               <button
  onClick={() => navigate(`/threads/${threadId}/create-task`)} // Changed from /thread/${threadId}/create-task
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
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
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
                              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium hover:bg-gray-100 transition text-gray-600"
                            >
                              {updatingTaskId === task.id ? (
                                <Loader className="animate-spin h-3 w-3" />
                              ) : (
                                task.taskStatus === 'TODO' ? 'Start' : 
                                task.taskStatus === 'IN_PROGRESS' ? 'Complete' : 'Update'
                              )}
                            </button>
                          )}
                          <button
  onClick={() => navigate(`/threads/${threadId}/tasks/${task.id}/edit`)} // Fixed path
  className="p-1.5 hover:bg-gray-200 rounded transition text-gray-500"
  title="Edit Task"
>
  <Edit className="w-4 h-4" />
</button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteTaskModal(true);
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition text-red-500"
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
        </div>
      </div>

      {/* Delete Thread Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Thread</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete thread <span className="font-semibold text-gray-800">"{thread.topic}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will also delete all tasks associated with this thread. This action cannot be undone.
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
                  onClick={handleDeleteThread}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete Thread'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTaskModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Task</h3>
              <button onClick={() => setShowDeleteTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete task <span className="font-semibold text-gray-800">"{taskToDelete.title}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteTaskModal(false)}
                  disabled={deletingTask}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={deletingTask}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center"
                >
                  {deletingTask ? (
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

export default ViewThread;