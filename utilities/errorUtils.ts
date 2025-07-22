export interface ErrorMessage {
  title: string;
  message: string;
}

export const getErrorMessage = (error: any): ErrorMessage => {
  // Handle timeout errors
  if (error?.message?.includes("timed out")) {
    return {
      title: "Connection Timeout",
      message:
        "The request took too long. Please check your internet connection and try again.",
    };
  }

  // Handle network errors
  if (error?.name === "NetworkError" || error?.message?.includes("network")) {
    return {
      title: "Connection Error",
      message:
        "Unable to connect to our servers. Please check your internet connection.",
    };
  }

  // Handle 404 errors
  if (error?.status === 404) {
    return {
      title: "Content Not Found",
      message: "The requested content could not be found.",
    };
  }

  // Handle 400 errors (bad request)
  if (error?.status === 400) {
    const errorMessage = error?.detail || error?.message || error?.response?.detail || error?.response?.message || "Invalid request";
    
    // Check for duplicate email
    if (errorMessage.toLowerCase().includes("email") && 
        (errorMessage.toLowerCase().includes("exists") || 
         errorMessage.toLowerCase().includes("taken") || 
         errorMessage.toLowerCase().includes("already"))) {
      return {
        title: "Email Already Registered",
        message: "This email is already registered. Please use a different email or sign in instead."
      };
    }
    
    // Generic 400 error
    return {
      title: "Registration Error",
      message: errorMessage
    };
  }

  // Handle 401/403 errors
  if (error?.status === 401 || error?.status === 403) {
    return {
      title: "Access Denied",
      message: "Please log in again to continue.",
    };
  }

  // Handle 500 server errors
  if (error?.status >= 500) {
    return {
      title: "Server Error",
      message: "Our servers are experiencing issues. Please try again later.",
    };
  }

  // Handle location-based errors (your current default)
  if (error?.message?.includes("location") || error?.status === 204) {
    return {
      title: "We are coming to your\narea soon! 🚀",
      message:
        "We don't have any content at your location currently, but we are working hard to bring amazing experiences to you soon!",
    };
  }

  // Default fallback
  return {
    title: "Something went wrong",
    message:
      error?.detail || error?.message || "An unexpected error occurred. Please try again.",
  };
};
