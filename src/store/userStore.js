// store/userStore.js
import { create } from "zustand";
import api from "../api/axios";

export const useUserStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  setUser: (userData, token) => {
    if (!userData || !token) {
      console.error("Invalid user data or token");
      return;
    }

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    set({ user: userData, token });
  },

  loadUser: () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    // Check if storedUser exists and is valid
    if (storedUser && storedUser !== "undefined" && storedUser !== "null" && token) {
      try {
        const user = JSON.parse(storedUser);
        set({ user, token });
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        set({ user: null, token: null });
      }
    } else {
      // Clear any invalid data
      if (storedUser === "undefined" || storedUser === "null") {
        localStorage.removeItem("user");
      }
      set({ user: null, token: null });
    }
    set({ loading: false });
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Your API returns data in response.data.data
      const { accessToken, user } = response.data.data;

      if (!user || !accessToken) {
        return {
          success: false,
          error: "Invalid response from server"
        };
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      set({ user, token: accessToken, loading: false });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed"
      };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.clear();
    set({ user: null, token: null, loading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      set({ loading: false, user: null, token: null });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const user = response.data.user;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, token, loading: false });
      } else {
        throw new Error("No user data");
      }
    } catch (error) {
      console.log("Auth check failed:", error);
      localStorage.clear();
      set({ user: null, token: null, loading: false });
    }
  },

  isAuthenticated: () => {
    return get().user !== null && get().token !== null;
  }
}));