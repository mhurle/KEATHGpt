// Custom hook to manage API key state
import { useEffect, useState } from "react";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    // Load API key from localStorage or other storage mechanism
    const storedApiKey = localStorage.getItem("openai-api-key") || "";
    setApiKey(storedApiKey);
  }, []);

  const updateApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem("openai-api-key", newKey);
  };

  return { apiKey, updateApiKey };
} 