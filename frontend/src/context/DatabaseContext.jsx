import { createContext, useContext, useState, useEffect } from "react";
import { listConnections } from "../api/dbApi";
import { useAuthContext } from "./AuthContext";

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  const { user } = useAuthContext();
  const [connections, setConnections] = useState([]);
  const [activeConnectionId, setActiveConnectionId] = useState(null);

  const refreshConnections = async () => {
    if (!user) {
      setConnections([]);
      setActiveConnectionId(null);
      return;
    }
    const res = await listConnections();
    setConnections(res.data.connections);
    setActiveConnectionId((prev) => {
      const stillExists = res.data.connections.some((c) => c.id === prev);
      if (stillExists) return prev;
      return res.data.connections.length > 0 ? res.data.connections[0].id : null;
    });
  };

  // Re-fetch (or clear) every time the logged-in user changes — fixes
  // stale data leaking from a previous account in the same browser tab.
  useEffect(() => {
    refreshConnections();
  }, [user?.id]);

  return (
    <DatabaseContext.Provider
      value={{ connections, activeConnectionId, setActiveConnectionId, refreshConnections }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}