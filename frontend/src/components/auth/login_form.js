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
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { showProfessionalToast } from "../customToast";
import { loginWithGoogle } from '@/lib/api';
import { useAuth } from "@/lib/authContext"; // Added Auth Hook

export function LoginForm() {
  const router = useRouter();
  const { setGoogleUser } = useAuth(); // Destructure the function here

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const {login} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // Note: Ensure loginUser in api.js takes (email, password) or an object
      const userData = await login(email, password);  
      showProfessionalToast("Login successful!");
      // window.location.href = "/profile";
      router.replace('/profile');
    } catch (err) {
      setError(err.message);
      showProfessionalToast(err.message || "Login failed");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google response received, sending to backend...");
      const res = await loginWithGoogle(credentialResponse.credential);
      
      // FIX: Ensure res.data.user exists before using it
      const userData = res.data.user; 
      
      if (userData) {
        // Sync everything
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        
        // This function now exists because we got it from useAuth()
        setGoogleUser(userData);
        
        showProfessionalToast("Logged in with Google!");
        // window.location.href = "/profile";
        router.replace('/profile');
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
      showProfessionalToast("Google login failed");
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded border">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError("Google Login Failed");
              showProfessionalToast("Google Login Failed");
            }}
          />
        </CardFooter>
      </form>
    </Card>
  );
}