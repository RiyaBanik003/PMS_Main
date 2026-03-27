import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllProjects } from '../services/projectService';
import { Search, Plus, Filter, Calendar, User, MoreVertical, RefreshCw } from 'lucide-react';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    fetchProjects();
  }, [pagination.page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Check if user is authenticated
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in. Please log in to view projects.");
        setLoading(false);
        return;
      }
      
      const response = await getAllProjects(pagination.page, pagination.limit);
      console.log("Projects API Response:", response);
      
      if (response && response.success) {
        let projectsData = response.data || [];
        let paginationData = {
          total: response.total || projectsData.length,
          page: response.page || 1,
          limit: response.limit || 10,
          totalPages: response.totalPages || 1
        };

        // Handle nested data structure
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          if (response.data.data && Array.isArray(response.data.data)) {
            projectsData = response.data.data;
            paginationData = {
              ...paginationData,
              ...(response.data.pagination || {}),
              total: response.data.total || projectsData.length
            };
          } else if (response.data.projects && Array.isArray(response.data.projects)) {
            projectsData = response.data.projects;
            paginationData = {
              ...paginationData,
              ...(response.data.pagination || {}),
              total: response.data.total || projectsData.length
            };
          }
        }

        console.log("Parsed projects data:", projectsData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setPagination(prev => ({
          ...prev,
          ...paginationData
        }));
      } else {
        console.warn("API response missing success property:", response);
        setProjects([]);
        setError("Failed to load projects. Please check your connection and try again.");
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Failed to load projects. Please try again.";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to view projects.";
      } else if (err.response?.status === 404) {
        errorMessage = "Projects API endpoint not found.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Strip HTML tags from description
  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Truncate text
  const truncateText = (text, length = 100) => {
    if (!text) return '';
    const cleanText = stripHtmlTags(text);
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002d74]">Projects</h1>
              <p className="text-sm text-gray-500 mt-1">
                Total {pagination.total} {pagination.total === 1 ? 'project' : 'projects'}
              </p>
            </div>
            
            <Link
              to="/editor"
              className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002d74] focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002d74]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Projects</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchProjects}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
                </p>
                {!searchTerm && (
                  <Link
                    to="/editor"
                    className="inline-flex items-center px-4 py-2 bg-[#002d74] text-white rounded-lg hover:bg-[#001a4d] transition"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Project
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                    >
                      <div className="p-6">
                        {/* Project Title */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[#002d74] group-hover:text-[#001a4d] transition line-clamp-2">
                            {project.title || 'Untitled Project'}
                          </h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle menu click
                            }}
                            className="text-gray-400 hover:text-gray-600 transition"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {truncateText(project.description, 120) || 'No description provided'}
                        </p>

                        {/* Project ID and Date */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            ID: {project.id}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {/* You can add created date here if available */}
                            Created
                          </span>
                        </div>
                      </div>

                      {/* Color bar at bottom */}
                      <div className="h-1 bg-linear-to-r from-[#002d74] to-[#1691fd] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 border rounded-md text-sm transition ${
                          pagination.page === i + 1
                            ? 'bg-[#002d74] text-white border-[#002d74]'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;