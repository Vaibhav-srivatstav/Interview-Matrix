"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function NotFound() {
  const [theme, setTheme] = useState("dark");

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="
      min-h-screen flex flex-col items-center justify-center text-center px-6
      bg-white text-black 
      dark:bg-gray-950 dark:text-white
      transition-colors duration-300
    ">
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full border 
        border-gray-300 dark:border-gray-700 
        hover:bg-gray-200 dark:hover:bg-gray-800 transition"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* 404 */}
      <h1 className="text-7xl font-extrabold tracking-tight mb-4">
        404
      </h1>

      {/* Message */}
      <h2 className="text-2xl font-semibold mb-2">
        Page not found
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      {/* Button */}
      <Link href="/">
        <Button className="
          px-6 py-2
          bg-black text-white hover:bg-neutral-800
          dark:bg-white dark:text-black dark:hover:bg-neutral-200
        ">
          Go back home
        </Button>
      </Link>

    </div>
  );
}