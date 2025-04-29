'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (userId === '54321' && password === 'globalIME') {
      router.push('/dashboard');
    } else {
      setError('Invalid User ID or Password');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-900">Login</h2>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="User ID"
              value={userId}
              onChange={(e:any) => setUserId(e.target.value)}
            />
          </div>
          <div>
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e:any) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button className="w-full cursor-pointer" onClick={handleLogin}>
            Login
          </Button>
        </div>
      </div>
    </main>
  );
}
