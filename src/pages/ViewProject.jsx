import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, deleteProject, updateProject, addProjectMember } from '../features/project/services/projectService';
import { getAllUsers } from '../features/project/services/userService';
import { getThreadsByProjectId, deleteThread } from '../features/thread/service/threadService'; // Add this import
import { ArrowLeft, Calendar, User, Tag, Users, Clock, Edit, Trash2, X, Save, MessageSquare, Trash2 as TrashIcon, Eye, UserPlus } from 'lucide-react'; // Add MessageSquare, TrashIcon, Eye, UserPlus
import { getAllRoles } from '../features/role/services/roleService'

const ViewProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Threads state
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Delete thread modal state
  const [showDeleteThreadModal, setShowDeleteThreadModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [deletingThread, setDeletingThread] = useState(false);

  // Add member state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  // Remove member state
  const [removingMember, setRemovingMember] = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProjectById(id);
      console.log("Project details:", response);

      if (response && response.success) {
        setProject(response.data);
        setEditFormData({
          title: response.data.title || '',
          description: response.data.description || ''
        });
      } else {
        setError("Project not found");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchThreads = useCallback(async () => {
    try {
      setThreadsLoading(true);
      const response = await getThreadsByProjectId(id);
      console.log("Threads response:", response);

      let threadsArray = [];

      if (response && response.success) {
        if (response.data && Array.isArray(response.data)) {
          threadsArray = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          threadsArray = response.data.data;
        } else if (Array.isArray(response)) {
          threadsArray = response;
        }
      }

      setThreads(threadsArray);
    } catch (err) {
      console.error("Error fetching threads:", err);
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, [id]);

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const rolesRes = await getAllRoles();
      console.log("Roles API:", rolesRes);

      let rolesData = [];
      if (rolesRes && rolesRes.success) {
        rolesData = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      }

      if (rolesData.length > 0) {
        setAvailableRoles(rolesData);
        console.log("Roles set:", rolesData);
      } else {
        setAvailableRoles([
          { id: 1, name: "developer", displayName: "👨‍💻 Developer" },
          { id: 2, name: "tester", displayName: "🧪 Tester" },
          { id: 3, name: "admin", displayName: "🛡️ Admin" }
        ]);
      }
    } catch (err) {
      console.log("Error fetching roles", err);
      setAvailableRoles([
        { id: 1, name: "developer", displayName: "👨‍💻 Developer" },
        { id: 2, name: "tester", displayName: "🧪 Tester" },
        { id: 3, name: "admin", displayName: "🛡️ Admin" }
      ]);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (activeTab === 'threads') {
      fetchThreads();
    }
  }, [activeTab, fetchThreads]);

  const handleDeleteThreadClick = (thread) => {
    setThreadToDelete(thread);
    setShowDeleteThreadModal(true);
  };

  const handleDeleteThreadConfirm = async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThread(true);
      const response = await deleteThread(threadToDelete.id);

      if (response && response.success) {
        setThreads(threads.filter(t => t.id !== threadToDelete.id));
        setShowDeleteThreadModal(false);
        setThreadToDelete(null);
      } else {
        alert(response?.message || "Failed to delete thread");
      }
    } catch (err) {
      console.error("Error deleting thread:", err);
      alert("Failed to delete thread");
    } finally {
      setDeletingThread(false);
    }
  };

  // Updated handleAddMember to use the correct endpoint: /:projectId/members/:userId
  const handleAddMember = async () => {
    if (!selectedUserId || !selectedRole) {
      setAddMemberError("Please select both user and role");
      return;
    }

    // Check if user is already a member
    if (project.members.some(member => member.userId.toString() === selectedUserId)) {
      setAddMemberError("This user is already a member of the project");
      return;
    }

    try {
      setAddingMember(true);
      setAddMemberError("");

      // Find the selected role object to get the role name
      const selectedRoleObj = availableRoles.find(r => r.id.toString() === selectedRole || r.name === selectedRole);
      const roleName = selectedRoleObj?.displayName || selectedRoleObj?.name || selectedRole;

      // Call the add member endpoint: /:projectId/members/:userId
      const response = await addProjectMember(id, selectedUserId, {
        roleName: roleName
      });

      console.log("Add member response:", response);

      if (response && response.success) {
        // Refresh project to get updated members list
        await fetchProject();
        setSelectedUserId("");
        setSelectedRole("");
        setShowAddMemberForm(false);
      } else {
        setAddMemberError(response?.message || "Failed to add member");
      }
    } catch (err) {
      console.error("Error adding member:", err);
      setAddMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  // Updated handleRemoveMember - might need a separate endpoint
  const handleRemoveMember = async (userId) => {
    try {
      setRemovingMember(userId);

      // If you have a separate remove member endpoint, use it
      // Otherwise fall back to update project
      try {
        // Try to use remove member endpoint if available
        // const response = await removeProjectMember(id, userId);

        // Fallback to update project
        const updatedMembers = project.members.filter(member => member.userId.toString() !== userId.toString());

        const response = await updateProject(id, {
          title: project.title,
          description: project.description,
          members: updatedMembers.map(({ userId, roleName }) => ({ userId, roleName }))
        });

        if (response && response.success) {
          setProject(prev => ({
            ...prev,
            members: updatedMembers
          }));
        } else {
          alert(response?.message || "Failed to remove member");
        }
      } catch (err) {
        console.error("Error removing member:", err);
        alert("Failed to remove member");
      }
    } finally {
      setRemovingMember(null);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      console.log("Loading available users...");
      const response = await getAllUsers();
      console.log("Users API response:", response);

      let usersData = [];
      if (response && response.success && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      } else if (response && Array.isArray(response.data)) {
        usersData = response.data;
      }

      console.log("Setting available users:", usersData);
      setAvailableUsers(usersData);
    } catch (err) {
      console.error("Error loading users:", err);
      setAvailableUsers([]);
    }
  };

  // Load available users and roles when add member form is opened
  const handleOpenAddMemberForm = async () => {
    setShowAddMemberForm(true);
    await loadAvailableUsers();
    await fetchRoles();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
    setUpdateError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      title: project.title || '',
      description: project.description || ''
    });
    setUpdateError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!editFormData.title.trim()) {
      setUpdateError('Project title is required');
      return;
    }

    try {
      setUpdating(true);
      setUpdateError('');

      const updateData = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim()
      };

      const response = await updateProject(id, updateData);
      console.log("Update response:", response);

      if (response && response.success) {
        setUpdateSuccess(true);
        setProject(prev => ({
          ...prev,
          title: editFormData.title,
          description: editFormData.description
        }));

        setTimeout(() => {
          setIsEditing(false);
          setUpdateSuccess(false);
        }, 1500);
      } else {
        setUpdateError(response?.message || 'Failed to update project');
      }
    } catch (err) {
      console.error("Error updating project:", err);
      setUpdateError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      setDeleteError('');

      const response = await deleteProject(id);
      console.log("Delete response:", response);

      if (response && response.success) {
        setDeleteSuccess(true);
        setTimeout(() => {
          setShowDeleteModal(false);
          navigate('/view-project');
        }, 2000);
      } else {
        setDeleteError(response?.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setDeleteError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteError('');
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
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
    switch (priority) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  };

  // Add this function to your projectService.js
  // export const addProjectMember = async (projectId, userId, data) => {
  //   try {
  //     const response = await api.post(`/projects/${projectId}/members/${userId}`, data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Add Project Member Error:", error.response?.data || error.message);
  //     throw error;
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#002d74] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/view-project')}
            className="px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Project not found</p>
          <button
            onClick={() => navigate('/view-project')}
            className="mt-4 px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/view-project')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleInputChange}
                    className="text-2xl font-bold text-[#002d74] border-b-2 border-[#002d74] focus:outline-none bg-transparent px-1"
                    placeholder="Project Title"
                    disabled={updating}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-[#002d74]">{project.title}</h1>
                )}
                <p className="text-sm text-gray-500">Project ID: #{project.id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={updating}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={updating}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                    title="Edit Project"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                    title="Delete Project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Success/Error Messages */}
      {updateSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            Project updated successfully!
          </div>
        </div>
      )}

      {updateError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error: {updateError}
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Project</h3>
              <button onClick={handleDeleteCancel} className="text-gray-500 hover:text-gray-700" disabled={deleting || deleteSuccess}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {deleteSuccess ? (
                <div className="text-center py-4">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Project Deleted!</h4>
                  <p className="text-gray-600">The project has been successfully deleted.</p>
                  <p className="text-sm text-gray-500 mt-2">Redirecting to projects list...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Are you sure you want to delete <span className="font-semibold text-gray-800">"{project.title}"</span>?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This action cannot be undone. All project data, including members and threads, will be permanently deleted.
                    </p>
                  </div>
                  {deleteError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      <span className="font-semibold">Error:</span> {deleteError}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button onClick={handleDeleteCancel} disabled={deleting} className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50">
                      Cancel
                    </button>
                    <button onClick={handleDeleteConfirm} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center">
                      {deleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        'Yes, Delete Project'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Thread Confirmation Modal */}
      {showDeleteThreadModal && threadToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete Thread</h3>
              <button onClick={() => setShowDeleteThreadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600">
                  Are you sure you want to delete thread <span className="font-semibold text-gray-800">"{threadToDelete.topic || threadToDelete.title || 'Untitled'}"</span>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowDeleteThreadModal(false)} disabled={deletingThread} className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handleDeleteThreadConfirm} disabled={deletingThread} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center">
                  {deletingThread ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Created</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(project.createdAt)}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Created By</p>
                <p className="text-sm font-semibold text-gray-800">User #{project.createdBy || 'N/A'}</p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Members</p>
                <p className="text-sm font-semibold text-gray-800">{project.members?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase">Threads</p>
                <p className="text-sm font-semibold text-gray-800">{Array.isArray(threads) ? threads.length : 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview'
                    ? 'border-b-2 border-[#002d74] text-[#002d74]'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'members'
                    ? 'border-b-2 border-[#002d74] text-[#002d74]'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Team Members ({project.members?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('threads')}
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'threads'
                    ? 'border-b-2 border-[#002d74] text-[#002d74]'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Threads ({Array.isArray(threads) ? threads.length : 0})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition resize-y"
                    placeholder="Enter project description..."
                    disabled={updating}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {stripHtmlTags(project.description) || 'No description provided'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
                  <button
                    onClick={handleOpenAddMemberForm}
                    className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </button>
                </div>

                {/* Add Member Form */}
                {showAddMemberForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Add New Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent"
                          disabled={addingMember}
                        >
                          <option value="">Choose a user...</option>
                          {availableUsers
                            .filter(u => !project.members.some(m => m.userId.toString() === u.id.toString()))
                            .map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.email})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent"
                          disabled={addingMember}
                        >
                          <option value="">Choose a role...</option>
                          {availableRoles.map((role) => (
                            <option key={role.id} value={role.id.toString()}>
                              {role.displayName || role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {addMemberError && (
                      <p className="text-red-600 text-sm mb-3">{addMemberError}</p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAddMemberForm(false);
                          setSelectedUserId("");
                          setSelectedRole("");
                          setAddMemberError("");
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        disabled={addingMember}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMember}
                        disabled={addingMember}
                        className="px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {addingMember ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Member
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Members List */}
                {project.members && project.members.length > 0 ? (
                  <div className="space-y-3">
                    {project.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#002d74] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{member.userName || `User #${member.userId}`}</p>
                            <p className="text-xs text-gray-500">ID: {member.userId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {member.roleName || 'Member'}
                          </span>
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={removingMember === member.userId}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Remove member"
                          >
                            {removingMember === member.userId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No team members assigned</p>
                )}
              </div>
            )}

            {/* Threads Tab */}
            {activeTab === 'threads' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Project Threads</h3>
                  <button
                    onClick={() => navigate(`/project/${id}/create-thread`)}
                    className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Create New Thread
                  </button>
                </div>

                {threadsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#002d74] border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading threads...</p>
                  </div>
                ) : !Array.isArray(threads) || threads.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Threads Yet</h4>
                    <p className="text-gray-500 mb-4">Start a conversation about this project</p>
                    <button
                      onClick={() => navigate(`/project/${id}/create-thread`)}
                      className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
                    >
                      Create First Thread
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {threads.map((thread) => (
                      <div key={thread.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">{thread.topic || thread.title || 'Untitled Thread'}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(thread.priority || 1)}`}>
                                {getPriorityLabel(thread.priority || 1)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{thread.description || thread.content || 'No description'}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                Assigned to: User #{thread.assignUserId || thread.assignedTo || 'N/A'}
                              </span>
                              {thread.dueDate && (
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Due: {formatDate(thread.dueDate)}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Created: {formatDate(thread.createdAt || thread.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {/* View thread details */ }}
                              className="p-1 hover:bg-gray-200 rounded transition text-gray-500"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteThreadClick(thread)}
                              className="p-1 hover:bg-red-100 rounded transition text-red-500"
                              title="Delete Thread"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProject;