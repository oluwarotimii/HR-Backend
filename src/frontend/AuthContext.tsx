// AuthContext.tsx
// Context to manage authentication state throughout the application

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from './api-service'; // Adjust the import path as needed

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    
    try {
      // Check if we have a token stored
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to get user permissions to validate the token
      const response = await apiService.getUserPermissions();
      
      if (response.success && response.data) {
        // If we get permissions, the token is valid
        // We'll need to get user info separately since the backend doesn't return it with permissions
        // For now, we'll create a minimal user object based on the token
        // In a real implementation, you might want a separate endpoint to get user details
        setUser({
          id: 0, // Placeholder - would come from token decode or API call
          email: 'unknown@example.com', // Placeholder
          full_name: 'Unknown User', // Placeholder
          role: 'user', // Placeholder
          permissions: response.data.permissions || []
        });
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data && response.data.token) {
        // Store the token
        apiService.setToken(response.data.token);
        
        // Update user state
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          full_name: response.data.user.full_name,
          role: response.data.user.role,
          permissions: response.data.user.permissions || []
        });
        
        return;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    // Call the backend logout endpoint
    apiService.logout().catch(error => {
      console.error('Logout API call failed:', error);
    });
    
    // Clear local state and token
    apiService.removeToken();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};