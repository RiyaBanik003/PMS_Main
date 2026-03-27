import React, { useState, useEffect } from 'react'
import EditorPreview from '../components/RichTextEditor'
import { createProject } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { getAllRoles } from '../../role/services/roleService'

const CreateProject = () => {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([]) // Add roles state
  const [selectedMembers, setSelectedMembers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("")

  // File upload state
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRes = await getAllUsers()
        console.log("Users API:", usersRes)

        let usersData = []
        if (usersRes && usersRes.success) {
          if (Array.isArray(usersRes.data)) {
            usersData = usersRes.data
          } else if (usersRes.data && Array.isArray(usersRes.data.users)) {
            usersData = usersRes.data.users
          } else if (usersRes.data && Array.isArray(usersRes.data.data)) {
            usersData = usersRes.data.data
          }
        }

        if (usersData.length > 0) {
          setUsers(usersData)
          console.log("Users set:", usersData)
        }

        // Fetch roles
        const rolesRes = await getAllRoles()
        console.log("Roles API:", rolesRes)

        let rolesData = []
        if (rolesRes && rolesRes.success) {
          rolesData = Array.isArray(rolesRes.data) ? rolesRes.data : []
        }

        if (rolesData.length > 0) {
          setRoles(rolesData)
          console.log("Roles set:", rolesData)
        } else {
          // Fallback to default roles if API fails
          setRoles([
            { id: 1, name: "developer", displayName: "👨‍💻 Developer" },
            { id: 2, name: "tester", displayName: "🧪 Tester" },
            { id: 3, name: "admin", displayName: "🛡️ Admin" }
          ])
        }

      } catch (err) {
        console.log("Error fetching data", err)
        setUsers([])
        // Set default roles on error
        setRoles([
          { id: 1, name: "developer", displayName: "👨‍💻 Developer" },
          { id: 2, name: "tester", displayName: "🧪 Tester" },
          { id: 3, name: "admin", displayName: "🛡️ Admin" }
        ])
      }
    }

    fetchData()
  }, [])

  const addMember = () => {
    if (!selectedUserId || !selectedRole) {
      alert("Please select both user and role")
      return
    }

    if (selectedMembers.some(member => member.userId === selectedUserId)) {
      alert("This user is already added")
      return
    }

    const selectedUser = users.find(u => u.id.toString() === selectedUserId)
    const selectedRoleObj = roles.find(r => r.id.toString() === selectedRole || r.name === selectedRole)

    setSelectedMembers([
      ...selectedMembers,
      {
        userId: selectedUserId,
        roleName: selectedRoleObj?.name || selectedRole,
        userName: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUserId
      }
    ])

    setSelectedUserId("")
    setSelectedRole("")
  }

  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(member => member.userId !== userId))
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    if (!selectedFile) return

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (selectedFile.size > maxSize) {
      setError("File size should be less than 5MB")
      setFile(null)
      setFilePreview(null)
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only images, PDF, and Word documents are allowed")
      setFile(null)
      setFilePreview(null)
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()

    if (!title || !desc) {
      alert("Please fill project title and description")
      return
    }

    if (selectedMembers.length === 0) {
      alert("Please add at least one member to the project")
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const stripHtmlTags = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
      }

      const cleanDescription = stripHtmlTags(desc);

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', cleanDescription)
      formData.append('members', JSON.stringify(selectedMembers.map(({ userId, roleName }) => ({
        userId,
        roleName
      }))))

      // Append file if selected
      if (file) {
        formData.append('file', file)
      }

      // Use axios with upload progress tracking
      const response = await createProject(formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      console.log("Project created", response)
      alert("Project created successfully!")

      // Reset form
      setTitle("")
      setDesc("")
      setSelectedMembers([])
      setSelectedUserId("")
      setSelectedRole("")
      setFile(null)
      setFilePreview(null)
      setUploadProgress(0)

    } catch (error) {
      console.log("Error creating project", error)
      setError(error.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .cp-root {
          min-height: 100vh;
          background: #f0f4ff;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 16px;
          position: relative;
          overflow-x: hidden;
        }

        .cp-root::before {
          content: '';
          position: fixed;
          top: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,45,116,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .cp-root::after {
          content: '';
          position: fixed;
          bottom: -100px; right: -80px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(22,145,253,0.09) 0%, transparent 70%);
          pointer-events: none;
        }

        .cp-wrapper {
          width: 100%;
          max-width: 680px;
          animation: fadeUp 0.45s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,45,116,0.07);
          border: 1px solid rgba(0,45,116,0.13);
          color: #002d74;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 13px;
          border-radius: 100px;
          margin-bottom: 14px;
        }

        .cp-eyebrow-dot {
          width: 6px; height: 6px;
          background: #ebab0c;
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.5); }
        }

        .cp-title {
          font-size: 28px;
          font-weight: 800;
          color: #001a4d;
          margin: 0 0 6px;
        }

        .cp-subtitle {
          color: #6b7fa3;
          font-size: 14px;
          font-weight: 400;
          margin: 0 0 32px;
        }

        .cp-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0,45,116,0.09);
          box-shadow: 0 4px 6px rgba(0,45,116,0.04), 0 20px 60px rgba(0,45,116,0.08);
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        .cp-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #002d74, #1691fd, #ebab0c);
        }

        .cp-field {
          margin-bottom: 26px;
          animation: fadeUp 0.4s ease both;
        }
        .cp-field:nth-child(1) { animation-delay: 0.05s; }
        .cp-field:nth-child(2) { animation-delay: 0.10s; }
        .cp-field:nth-child(3) { animation-delay: 0.15s; }
        .cp-field:nth-child(4) { animation-delay: 0.20s; }

        .cp-label {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 600;
          color: #002d74;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 9px;
        }

        .cp-step {
          width: 22px; height: 22px;
          background: #002d74;
          color: white;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cp-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fafbff;
          font-size: 14px;
          color: #001a4d;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .cp-input::placeholder { color: #b0bcd4; }

        .cp-input:focus {
          border-color: #002d74;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0,45,116,0.07);
        }

        .cp-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23002d74' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          cursor: pointer;
        }

        .cp-editor-wrap {
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          overflow: hidden;
          background: #fafbff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cp-editor-wrap:focus-within {
          border-color: #002d74;
          box-shadow: 0 0 0 4px rgba(0,45,116,0.07);
        }

        /* File upload styles */
        .cp-file-upload {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fafbff;
        }

        .cp-file-upload:hover {
          border-color: #002d74;
          background: #f0f4ff;
        }

        .cp-file-input {
          display: none;
        }

        .cp-file-label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .cp-file-icon {
          font-size: 32px;
        }

        .cp-file-text {
          color: #6b7fa3;
          font-size: 13px;
        }

        .cp-file-name {
          margin-top: 8px;
          font-size: 12px;
          color: #002d74;
          font-weight: 500;
        }

        .cp-file-preview {
          margin-top: 12px;
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
        }

        .cp-progress-bar {
          margin-top: 8px;
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .cp-progress-fill {
          height: 100%;
          background: #002d74;
          transition: width 0.3s ease;
        }

        .cp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 28px 0;
        }

        .cp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 11px 15px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #c0392b;
          font-size: 13px;
        }

        .cp-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          align-items: center;
        }

        .cp-btn-cancel {
          padding: 12px 22px;
          border-radius: 12px;
          border: 1.5px solid #dde3ef;
          background: transparent;
          color: #6b7fa3;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cp-btn-cancel:hover {
          background: #f0f4ff;
          border-color: #b0bcd4;
          color: #002d74;
        }

        .cp-btn-submit {
          position: relative;
          padding: 12px 30px;
          border-radius: 12px;
          border: none;
          background: #002d74;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cp-btn-submit:hover:not(:disabled) {
          background: #001a4d;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,45,116,0.3);
        }

        .cp-btn-submit:active:not(:disabled) { transform: translateY(0); }

        .cp-btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .cp-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .cp-btn-arrow {
          transition: transform 0.2s ease;
          font-size: 15px;
        }

        .cp-btn-submit:hover .cp-btn-arrow { transform: translateX(3px); }

        .cp-members-list {
          margin-top: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          background: #fafbff;
        }

        .cp-member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .cp-member-item:last-child {
          border-bottom: none;
        }

        .cp-member-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .cp-member-name {
          font-weight: 600;
          color: #001a4d;
        }

        .cp-member-role {
          background: #e2e8f0;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          color: #002d74;
        }

        .cp-remove-btn {
          background: none;
          border: none;
          color: #c0392b;
          cursor: pointer;
          font-size: 18px;
          padding: 0 8px;
        }

        .cp-remove-btn:hover {
          color: #e74c3c;
        }

        .cp-add-member-row {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .cp-add-member-row select {
          flex: 1;
        }

        .cp-add-btn {
          background: #002d74;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0 20px;
          cursor: pointer;
          font-weight: 600;
        }

        .cp-add-btn:hover {
          background: #001a4d;
        }
      `}</style>

      <div className="cp-root">
        <div className="cp-wrapper">
          <div className="cp-eyebrow">
            <span className="cp-eyebrow-dot" />
            New Project
          </div>
          <h1 className="cp-title">Create a Project</h1>
          <p className="cp-subtitle">Fill in the details below to get your project started.</p>

          <div className="cp-card">
            <form onSubmit={handleCreateProject}>
              <div className="cp-field">
                <label className="cp-label">
                  <span className="cp-step">1</span>
                  Project Name
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Customer Portal Redesign"
                  className="cp-input"
                />
              </div>

              <div className="cp-field">
                <label className="cp-label">
                  <span className="cp-step">2</span>
                  Description
                </label>
                <div className="cp-editor-wrap">
                  <EditorPreview value={desc} onChange={setDesc} />
                </div>
              </div>

              {/* File Upload Field */}
              <div className="cp-field">
                <label className="cp-label">
                  <span className="cp-step">3</span>
                  Attach File (Optional)
                </label>
                <div className="cp-file-upload">
                  <input
                    type="file"
                    id="file-upload"
                    className="cp-file-input"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cp-file-label">
                    <div className="cp-file-icon">📎</div>
                    <div className="cp-file-text">
                      Click to upload or drag and drop
                    </div>
                    <div className="cp-file-text" style={{ fontSize: '11px' }}>
                      Supported: Images, PDF, Word (Max 5MB)
                    </div>
                  </label>
                  {file && (
                    <>
                      <div className="cp-file-name">
                        Selected: {file.name}
                      </div>
                      {filePreview && (
                        <img src={filePreview} alt="Preview" className="cp-file-preview" />
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="cp-progress-bar">
                          <div
                            className="cp-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="cp-field">
                <label className="cp-label">
                  <span className="cp-step">4</span>
                  Add Team Members
                </label>

                <div className="cp-add-member-row">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="cp-input cp-select"
                  >
                    <option value="">Select user</option>
                    {users
                      .filter(u => !selectedMembers.some(m => m.userId === u.id.toString()))
                      .map((u) => (
                        <option key={u.id} value={u.id.toString()}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                  </select>

                  {/* Dynamic Role Select Dropdown */}
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="cp-input cp-select"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.displayName || role.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addMember}
                    className="cp-add-btn"
                  >
                    Add
                  </button>
                </div>

                {selectedMembers.length > 0 && (
                  <div className="cp-members-list">
                    <h4 style={{ margin: '0 0 10px 0', color: '#002d74' }}>Team Members:</h4>
                    {selectedMembers.map((member) => (
                      <div key={member.userId} className="cp-member-item">
                        <div className="cp-member-info">
                          <span className="cp-member-name">{member.userName}</span>
                          <span className="cp-member-role">{member.roleName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.userId)}
                          className="cp-remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cp-divider" />

              {error && (
                <div className="cp-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="cp-actions">
                <button type="button" className="cp-btn-cancel">Cancel</button>
                <button type="submit" disabled={loading} className="cp-btn-submit">
                  {loading ? (
                    <><span className="cp-spinner" /> Creating...</>
                  ) : (
                    <>Create Project <span className="cp-btn-arrow">→</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}


export default CreateProject