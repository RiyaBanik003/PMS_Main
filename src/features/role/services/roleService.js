import api from "../../../api/axios";
export const createRole = async (roleData) => {
    try {
        const response = await api.post("/roles", roleData);
        return response.data;
    } catch (error) {
        console.error("Create Role Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllRoles = async () => {
    try {
        const response = await api.get("/roles");

        // Handle your API response structure
        let roles = [];

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            roles = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            roles = response.data;
        }

        return {
            success: true,
            data: roles
        };
    } catch (error) {
        console.error("Get Roles Error:", error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || "Failed to fetch roles"
        };
    }
};

export const deleteRole = async (roleId) => {
    try {
        console.log(`Attempting to delete role with ID: ${roleId}`);

        // Ensure roleId is a valid number or string
        if (!roleId) {
            throw new Error("Role ID is required");
        }

        const response = await api.delete(`/roles/${roleId}`);

        console.log("Delete response:", response.data);

        return response.data;
    } catch (error) {
        console.error("Delete Role Error:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error status:", error.response?.status);
        throw error;
    }
};