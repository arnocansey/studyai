import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, UserProfile } from "../services/auth";
import { loadAuthToken } from "../services/api";

export interface UserData {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  coursesCompleted: number;
  badges: number;
  avgScore: number;
  joinDate: string;
  role: string;
}

interface UserContextType {
  user: UserData;
  updateUser: (data: Partial<UserData>) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const DEFAULT_USER: UserData = {
  id: "",
  name: "Student",
  email: "",
  bio: "Full-stack developer in training. Love building things with code!",
  avatar: "🧑‍💻",
  xp: 0,
  level: 1,
  streak: 0,
  coursesCompleted: 0,
  badges: 0,
  avgScore: 0,
  joinDate: new Date().toISOString(),
  role: "STUDENT",
};

const UserContext = createContext<UserContextType>({
  user: DEFAULT_USER,
  updateUser: () => {},
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await loadAuthToken();
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser((prev) => ({
            ...prev,
            id: profile.id,
            name: profile.name,
            email: profile.email,
            xp: profile.xp || 0,
            level: profile.level || 1,
            streak: profile.streak || 0,
            role: profile.role,
          }));
          setIsAuthenticated(true);
        } catch {
          void authApi.logout();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser((prev) => ({
      ...prev,
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role,
    }));
    setIsAuthenticated(true);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setUser((prev) => ({
      ...prev,
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role,
    }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    void authApi.logout();
    setUser(DEFAULT_USER);
    setIsAuthenticated(false);
  };

  const updateUser = (data: Partial<UserData>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        login,
        signup,
        logout,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
