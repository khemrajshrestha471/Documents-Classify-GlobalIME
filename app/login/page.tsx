// 'use client';

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = () => {
//     if (userId === '54321' && password === 'globalIME') {
//       router.push('/dashboard');
//     } else {
//       setError('Invalid User ID or Password');
//     }
//   };

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4fa] p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6 border border-[#004189]/20">
//         <h2 className="text-3xl font-bold text-center text-[#004189]">Login</h2>

//         <div className="space-y-4">
//           <Input
//             placeholder="User ID"
//             value={userId}
//             onChange={(e: any) => setUserId(e.target.value)}
//             className="focus-visible:ring-[#004189]"
//           />
//           <Input
//             placeholder="Password"
//             type="password"
//             value={password}
//             onChange={(e: any) => setPassword(e.target.value)}
//             className="focus-visible:ring-[#004189]"
//           />
//           {error && <p className="text-[#C5161D] text-sm text-center">{error}</p>}

//           <Button
//             className="w-full bg-[#C5161D] hover:bg-[#a51217] text-white font-semibold py-2 rounded-md cursor-pointer"
//             onClick={handleLogin}
//           >
//             Login
//           </Button>
//         </div>
//       </div>
//     </main>
//   );
// }

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
    <main className="fixed inset-0 min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#C5161D] to-[#004189]">
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-md border border-[#004189]/30">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-[#004189]">DocuScan Login</h1>
          <p className="text-sm text-[#C5161D] mt-1 font-medium">Secure Access to Your Account</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <Input
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e: any) => setUserId(e.target.value)}
              className="focus-visible:ring-[#C5161D] border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              className="focus-visible:ring-[#C5161D] border-gray-300"
            />
          </div>

          {error && <p className="text-[#C5161D] text-sm text-center">{error}</p>}

          <Button
            className="w-full bg-[#C5161D] hover:bg-[#a51217] text-white font-semibold py-2 rounded-lg transition duration-150 ease-in-out cursor-pointer"
            onClick={handleLogin}
          >
            Sign In
          </Button>

        </div>

        <div className="border-t mt-6 pt-4 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} <span className="text-[#004189] font-semibold">Global IME Bank Ltd.</span> All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
