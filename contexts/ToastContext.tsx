import React, { createContext, useContext, useState, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info", hasTabBar?: boolean) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
  hasTabBar?: boolean;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
    hasTabBar?: boolean
  ) => {
    setToast({
      visible: true,
      message,
      type,
      hasTabBar,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Import Toast component dynamically to avoid circular dependency */}
      {toast.visible && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          hasTabBar={toast.hasTabBar}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Import Toast component at the bottom to avoid issues
import Toast from "@/components/Toast/Toast";