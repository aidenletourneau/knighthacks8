"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const register = async (email: string, username: string, password: string) => {
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || 'Registration failed');
    }
    return await response.json();
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    register(email, name, password)
      .then(() => {
        alert("Registration successful! Please log in.");
        router.push("/login");
      })
      .catch((err) => alert(err.message || 'Registration failed'));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Sign up for a free account to save your scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
                <Button type="submit">Create account</Button>
                <Link href="/login" className="text-sm text-white/80">Have an account?</Link>
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
