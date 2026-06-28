import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { logout as logoutApi } from "../api/authApi";

const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

export function useIdleLogout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    async function handleIdle() {
      await logoutApi().catch(() => {});
      setUser(null);
      navigate("/login");
    }

    function resetTimer() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleIdle, IDLE_LIMIT_MS);
    }

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user]);
}