"use client"
import { currentUserFetcher } from "@/lib/auth";
import type { User } from "../types/auth_interface";
import { useEffect, useState, useRef } from "react";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevTokenRef = useRef<string | null>(null);

  const getCurrentUser = async () => {
    setIsLoading(true);
    try {
      const user = await currentUserFetcher();
      setCurrentUser(user || null);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
    prevTokenRef.current = localStorage.getItem("access_token");
    const onStorage = (e: StorageEvent) => {
      if (e.key === "__Pearl_Token" || e.key === "__Pearl_Refresh_Token") {
        getCurrentUser();
      }
    };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(() => {
      const token = localStorage.getItem("__Pearl_Token");
      if (token !== prevTokenRef.current) {
        prevTokenRef.current = token;
        getCurrentUser();
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  return { currentUser, isLoading };
};
