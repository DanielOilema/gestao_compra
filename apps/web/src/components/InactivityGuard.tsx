import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const IDLE_LIMIT_MS = 120 * 60 * 1000; // 120 minutos sem interação
const ABSOLUTE_LIMIT_MS = 120 * 60 * 1000; // 120 minutos após o login
const LOGIN_AT_KEY = "oilema:auth:loginAt";
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"] as const;

const InactivityGuard: React.FC = () => {
  const { isAuthenticated, expireSession } = useAuth();
  const idleTimerRef = useRef<number | null>(null);
  const absoluteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.removeItem(LOGIN_AT_KEY);
      } catch {
        /* noop */
      }
      return;
    }

    // Marca o instante do login (persistido para sobreviver a refresh)
    let loginAt: number;
    try {
      const stored = localStorage.getItem(LOGIN_AT_KEY);
      loginAt = stored ? Number(stored) : NaN;
      if (!Number.isFinite(loginAt) || loginAt <= 0) {
        loginAt = Date.now();
        localStorage.setItem(LOGIN_AT_KEY, String(loginAt));
      }
    } catch {
      loginAt = Date.now();
    }

    const doLogout = (reason: "idle" | "absolute") => {
      try {
        localStorage.removeItem(LOGIN_AT_KEY);
      } catch {
        /* noop */
      }
      expireSession(
        reason === "idle"
          ? "Sessão encerrada por inatividade."
          : "Sessão expirada (limite de 2 horas atingido).",
      );
    };

    const resetIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => doLogout("idle"), IDLE_LIMIT_MS);
    };

    // Timer absoluto: tempo restante desde o login
    const remainingAbsolute = Math.max(0, ABSOLUTE_LIMIT_MS - (Date.now() - loginAt));
    if (remainingAbsolute === 0) {
      doLogout("absolute");
      return;
    }
    absoluteTimerRef.current = window.setTimeout(() => doLogout("absolute"), remainingAbsolute);

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      if (absoluteTimerRef.current !== null) window.clearTimeout(absoluteTimerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [isAuthenticated, expireSession]);

  return null;
};

export default InactivityGuard;
