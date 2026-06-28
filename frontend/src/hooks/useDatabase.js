import { useDatabaseContext } from "../context/DatabaseContext";

export function useDatabase() {
  return useDatabaseContext();
}
