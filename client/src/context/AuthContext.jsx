import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  {
    role: 'Member',
    email: 'explorer@edupulse.edu',
    password: 'Member@123',
    name: 'Aryan Verma',
    title: 'Campus Explorer (Normal User)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    description: 'Explore campus facilities, academics, fee estimator & submit role upgrade requests.',
  },
  {
    role: 'Super Admin',
    email: 'admin@edupulse.edu',
    password: 'Admin@123',
    name: 'Dr. Arthur Sterling',
    title: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    description: 'Full campus governance, institutional role approvals, security audits.',
  },
  {
    role: 'Principal',
    email: 'principal@edupulse.edu',
    password: 'Principal@123',
    name: 'Eleanor Vance',
    title: 'School Principal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    description: 'Faculty supervision, approve Teacher & Student role permissions.',
  },
  {
    role: 'Teacher',
    email: 'teacher@edupulse.edu',
    password: 'Teacher@123',
    name: 'Prof. Marcus Brody',
    title: 'Head of Mathematics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    description: 'Mark attendance, manage exams, assignments & grades.',
  },
  {
    role: 'Accountant',
    email: 'accountant@edupulse.edu',
    password: 'Accountant@123',
    name: 'Sarah Jenkins',
    title: 'Finance & Accounts Officer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    description: 'Collect fees, generate receipts, oversee billing records.',
  },
  {
    role: 'Student',
    email: 'student@edupulse.edu',
    password: 'Student@123',
    name: 'Lucas Miller',
    title: 'Grade 10 - Section A',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    description: 'View schedule, submit homework, see results & fees.',
  },
  {
    role: 'Parent',
    email: 'parent@edupulse.edu',
    password: 'Parent@123',
    name: 'David Miller',
    title: "Parent of Lucas Miller",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Track child attendance, grades, notices & pay fees.',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edupulse_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('edupulse_token');
      const storedUser = localStorage.getItem('edupulse_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (isMounted) {
            setUser(parsedUser);
            setToken(storedToken);
          }
          // Verify with backend
          const res = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const verifiedUser = res.data?.data?.user || res.data?.data;
          if (verifiedUser && verifiedUser.email) {
            if (isMounted) {
              setUser(verifiedUser);
              localStorage.setItem('edupulse_user', JSON.stringify(verifiedUser));
            }
          } else {
            throw new Error('Invalid user verification');
          }
        } catch (e) {
          localStorage.removeItem('edupulse_token');
          localStorage.removeItem('edupulse_user');
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, token: userToken } = res.data.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('edupulse_token', userToken);
      localStorage.setItem('edupulse_user', JSON.stringify(userData));
      return { success: true, user: userData, data: { user: userData } };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', userData);
      const { user: newUser, token: userToken } = res.data.data;
      setUser(newUser);
      setToken(userToken);
      localStorage.setItem('edupulse_token', userToken);
      localStorage.setItem('edupulse_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const loginWithDemo = async (roleName) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === roleName) || DEMO_ACCOUNTS[0];
    return await login(account.email, account.password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('edupulse_token');
    localStorage.removeItem('edupulse_user');
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('edupulse_token');
    if (!storedToken) return;
    try {
      const res = await api.get('/auth/me');
      const verifiedUser = res.data?.data?.user || res.data?.data;
      if (verifiedUser) {
        setUser(verifiedUser);
        localStorage.setItem('edupulse_user', JSON.stringify(verifiedUser));
      }
    } catch (e) {}
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put('/auth/profile', updateData);
      const updatedUser = res.data?.data?.user || res.data?.data;
      if (!updatedUser) throw new Error('Invalid profile response');
      setUser(updatedUser);
      localStorage.setItem('edupulse_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        loginWithDemo,
        switchDemoUser: loginWithDemo,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'Super Admin',
        isPrincipal: user?.role === 'Principal',
        isAdmin: ['Super Admin', 'School Admin', 'Principal'].includes(user?.role),
        isTeacher: user?.role === 'Teacher',
        isStudent: user?.role === 'Student',
        isParent: user?.role === 'Parent',
        isAccountant: user?.role === 'Accountant',
        isMember: !user?.role || user?.role === 'Member' || user?.role === 'Visitor',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
