import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8985";

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.isAuthError = true;
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error(
      "You are not logged in. Please log in to access the dashboard."
    );
    throw new AuthenticationError(
      "You are not authorized. Please log in first."
    );
  }

  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

const handleApiError = (error, context) => {
  console.error(`Error in ${context}:`, error);

  // Check if it's an authentication error
  if (error.response?.status === 401 || error.response?.status === 403) {
    throw new AuthenticationError("Session expired. Please log in again.");
  }

  // Check if it's our custom auth error
  if (error.isAuthError || error instanceof AuthenticationError) {
    throw error;
  }

  // For other errors, throw them as is
  throw error;
};

const DashboardService = {
  // Fetch directory data (teams and users)
  getDirectoryData: async () => {
    try {
      const authHeaders = getAuthHeaders();
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/directory`,
        authHeaders
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "getDirectoryData");
    }
  },

  // Helper method to check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Helper method to logout user
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

export default DashboardService;
export { AuthenticationError };
