"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, password)
      .then(() => {
        router.push("/");
      })
      .catch((err) => alert(err.message || 'Login failed'));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <Button type="submit">Sign In</Button>
                <Link href="/signup" className="text-sm text-white/80">Create account</Link>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Link href="/">
                <Button variant="outline">← Back to home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
