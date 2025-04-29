// 'use client';

// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";

// export default function LandingPage() {
//   const router = useRouter();

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
//       <div className="text-center space-y-6">
//         <h1 className="text-4xl font-bold text-blue-900">Document Classification Portal</h1>
//         <p className="text-lg text-blue-700 max-w-xl mx-auto">
//           Seamlessly classify documents like Citizenship, Passport, PAN Card, and more. Extract important information securely and efficiently.
//         </p>
//         <Button
//           className="px-6 py-3 text-lg"
//           onClick={() => router.push('/login')}
//         >
//           Login
//         </Button>
//       </div>
//     </main>
//   );
// }




'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-blue-900">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-10">
        <div className="max-w-l space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Intelligent Document Classification System
          </h1>
          <p className="text-lg text-blue-700">
            Automate identification and information extraction from Citizenship, Passport, PAN Card, Account Forms and more — with precision and speed.
          </p>
          <Button
            className="px-6 py-3 text-lg cursor-pointer bg-blue-900 hover:bg-blue-800"
            onClick={() => router.push('/login')}
          >
            Get Started
          </Button>
        </div>
        <div className="w-full max-w-md">
          <Image
            src="/document-scan.gif"
            alt="Document scanning animation"
            width={500}
            height={500}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">AI-Powered Classification</h3>
            <p>Detect document type instantly using deep learning models trained on real-world data.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">OCR Text Extraction</h3>
            <p>Extract all relevant data with high accuracy for downstream systems to consume.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2">Secure Environment</h3>
            <p>Runs in an isolated, bank-grade secured environment — no data leaks, guaranteed privacy.</p>
          </div>
        </div>
      </section>

      {/* Animated Video Section */}
      <section className="py-16 px-6 md:px-20 bg-blue-100">
  <h2 className="text-3xl font-bold text-center mb-12">See It In Action</h2>
  <div className="flex justify-center">
    <video
      autoPlay
      loop
      controls
      className="rounded-xl shadow-lg max-w-3xl w-full"
    >
      <source src="/demo-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</section>


      {/* Call to Action */}
      <section className="bg-blue-900 text-white py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Classify Documents the Smart Way?</h2>
        <p className="mb-6 text-lg">Click below to begin your journey with intelligent automation.</p>
        <Button
          className="px-8 py-4 text-lg bg-white text-blue-900 hover:bg-blue-100 cursor-pointer"
          onClick={() => router.push('/login')}
        >
          Login
        </Button>
      </section>
    </main>
  );
}
