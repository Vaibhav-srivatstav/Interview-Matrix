"use client";

import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleLogin } from "@react-oauth/google";
import { showProfessionalToast } from "../customToast";
import { useAuth } from "@/lib/authContext"; // Import Auth Hook
import api, { loginWithGoogle, registerUser } from "@/lib/api"; // Import centralized API

export function RegisterForm() {
  const router = useRouter();
  const { setGoogleUser } = useAuth(); // Destructure the setter

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Hydration Fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // Using centralized registerUser from api.js
      await registerUser({ name, email, password });

      showProfessionalToast("Registration successful! Please login.");
      router.push("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      showProfessionalToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Using centralized loginWithGoogle from api.js
      const res = await loginWithGoogle(credentialResponse.credential);
      const userData = res.data.user;

      if (userData) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Sync with AuthContext
        setGoogleUser(userData);

        showProfessionalToast("Logged in with Google!");
        window.location.href = "/profile";
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Google login failed";
      showProfessionalToast(msg);
      setError(msg);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Get started with your AI-powered interview platform
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ram Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              showProfessionalToast("Google Login Failed");
              setError("Google Login Failed");
            }}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </CardFooter>
      </form>
    </Card>
  );
}