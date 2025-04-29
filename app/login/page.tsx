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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4fa] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6 border border-[#004189]/20">
        <h2 className="text-3xl font-bold text-center text-[#004189]">Login</h2>

        <div className="space-y-4">
          <Input
            placeholder="User ID"
            value={userId}
            onChange={(e: any) => setUserId(e.target.value)}
            className="focus-visible:ring-[#004189]"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            className="focus-visible:ring-[#004189]"
          />
          {error && <p className="text-[#C5161D] text-sm text-center">{error}</p>}

          <Button
            className="w-full bg-[#C5161D] hover:bg-[#a51217] text-white font-semibold py-2 rounded-md cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </Button>
        </div>
      </div>
    </main>
  );
}
