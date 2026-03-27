import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreadsByProjectId, deleteThread } from '../../thread/service/threadService';
import { getAllProjects } from '../../project/services/projectService';
import { MessageSquare, Plus, Trash2, Eye, Calendar, User, X, Loader } from 'lucide-react';

const Threads = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllThreads();
  }, []);

  const fetchAllThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all projects
      const projectsRes = await getAllProjects(1, 100);
      console.log("Projects API Response:", projectsRes);
      
      if (projectsRes && projectsRes.success) {
        const projectsData = projectsRes.data?.data || projectsRes.data || [];
        setProjects(projectsData);
        
        // If there are no projects, set empty threads
        if (projectsData.length === 0) {
          setThreads([]);
          setLoading(false);
          return;
        }
        
        // Fetch threads for each project
        let allThreads = [];
        
        for (const project of projectsData) {
          try {
            console.log(`Fetching threads for project ${project.id} - ${project.title}`);
            const threadsRes = await getThreadsByProjectId(project.id);
            console.log(`Response for project ${project.id}:`, threadsRes);
            
            // Handle different response structures
            let threadsData = [];
            if (threadsRes && threadsRes.success) {
              // Check if data is in threadsRes.data or directly in threadsRes
              if (threadsRes.data && Array.isArray(threadsRes.data)) {
                threadsData = threadsRes.data;
              } else if (threadsRes.data && threadsRes.data.data && Array.isArray(threadsRes.data.data)) {
                threadsData = threadsRes.data.data;
              } else if (Array.isArray(threadsRes)) {
                threadsData = threadsRes;
              } else {
                threadsData = [];
              }
            }
            
            threadsData.forEach(thread => {
              allThreads.push({
                ...thread,
                projectId: project.id,
                projectTitle: project.title
              });
            });
          } catch (err) {
            console.error(`Error fetching threads for project ${project.id}:`, err);
            // Continue with other projects even if one fails
          }
        }
        
        // Sort by created date (newest first)
        allThreads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setThreads(allThreads);
        console.log("All threads loaded:", allThreads.length);
      } else {
        setError("Failed to load projects");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load threads. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (thread) => {
    setThreadToDelete(thread);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!threadToDelete) return;
    
    try {
      setDeleting(true);
      const response = await deleteThread(threadToDelete.id);
      console.log("Delete response:", response);
      
      if (response && response.success) {
        setThreads(threads.filter(t => t.id !== threadToDelete.id));
        setShowDeleteModal(false);
        setThreadToDelete(null);
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
      default: return { label: 'Normal', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredThreads = selectedProject === 'all' 
    ? threads 
    : threads.filter(t => t.projectId === parseInt(selectedProject));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin rounded-full h-12 w-12 text-[#002d74] mx-auto mb-4" />
          <p className="text-gray-600">Loading threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Threads</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage all project discussions and issues
              </p>
            </div>
            <button
              onClick={() => navigate('/threads/create')}
              className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Thread
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info - Remove after testing */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Total Projects: {projects.length}</p>
          <p>Total Threads Found: {threads.length}</p>
          <p>Filtered Threads: {filteredThreads.length}</p>
        </div>

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent bg-white"
            >
              <option value="all">All Projects ({threads.length})</option>
              {projects.map(project => {
                const projectThreadCount = threads.filter(t => t.projectId === project.id).length;
                return (
                  <option key={project.id} value={project.id}>
                    {project.title} ({projectThreadCount})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Threads Found</h3>
            <p className="text-gray-500 mb-6">
              {threads.length === 0 
                ? 'Create your first thread to start a discussion'
                : selectedProject !== 'all' 
                  ? 'No threads in this project yet'
                  : 'No threads found'}
            </p>
            {threads.length === 0 && (
              <button
                onClick={() => navigate('/threads/create')}
                className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Thread
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredThreads.map((thread) => {
              const priority = getPriorityBadge(thread.priority);
              return (
                <div
                  key={thread.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/thread/${thread.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#002d74]">{thread.topic}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                          Priority: {priority.label}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {thread.projectTitle}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{thread.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          Assigned to: User #{thread.assignUserId}
                        </span>
                        {thread.dueDate && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {formatDate(thread.dueDate)}
                          </span>
                        )}
                        <span className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Created: {formatDate(thread.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/thread/${thread.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
                        title="View Thread"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(thread);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                        title="Delete Thread"
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
      {showDeleteModal && threadToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Thread</h3>
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
                  Are you sure you want to delete thread <span className="font-semibold text-gray-800">"{threadToDelete.topic}"</span>?
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
                    'Yes, Delete Thread'
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

export default Threads;