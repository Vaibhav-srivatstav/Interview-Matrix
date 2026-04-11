// 'use client';
// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext(null);

// const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔥 Check auth using cookie
//   useEffect(() => {
//     axios
//       .get(`${API}/api/auth/me`, {
//         withCredentials: true, // IMPORTANT
//       })
//       .then((res) => setUser(res.data.user))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   // 🔥 Login (cookie will be set by backend)
//   const login = async (email, password) => {
//     const res = await axios.post(
//       `${API}/api/auth/login`,
//       { email, password },
//       { withCredentials: true }
//     );

//     setUser(res.data.user);
//     return res.data;
//   };

//   // 🔥 Register
//   const register = async (name, email, password) => {
//     const res = await axios.post(
//       `${API}/api/auth/register`,
//       { name, email, password },
//       { withCredentials: true }
//     );

//     setUser(res.data.user);
//     return res.data;
//   };

//   // 🔥 Logout
//   const logout = async () => {
//     try {
//       await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
//     } catch (error) {
//       localStorage.removeItem("user");
//     setUser(null);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch logged-in user (IMPORTANT)
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Run on app load
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Login function
  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    setUser(data.user);
  };

  // ✅ Logout
  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);