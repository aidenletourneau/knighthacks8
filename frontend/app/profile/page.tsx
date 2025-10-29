"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: number; email: string; username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setUser(await res.json());
      } catch {
        router.push('/login');
      }
    };
    load();
  }, [router]);

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div><span className="text-white/70">Username:</span> {user.username}</div>
                <div><span className="text-white/70">Email:</span> {user.email}</div>
                <div><span className="text-white/70">User ID:</span> {user.id}</div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">← Home</Button>
            </Link>
            <Button onClick={logout} variant="destructive">Log out</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


