'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C5161D] to-white text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 gap-10">
        <div className="max-w-xl space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
            Intelligent Document Classification System
          </h1>
          <p className="text-lg text-white/90">
            Automate identification and extraction of key details from Citizenship, Passport, PAN Card, and more — all with security and accuracy.
          </p>
          <Button
            className="px-6 py-3 text-lg cursor-pointer bg-white text-[#C5161D] hover:bg-gray-200 font-semibold"
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
        <h2 className="text-3xl font-bold text-center mb-12 text-[#004189]">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-[#004189]/10 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2 text-[#C5161D]">AI-Powered Classification</h3>
            <p className="text-gray-800">Detect document type instantly using deep learning models trained on real-world data.</p>
          </div>
          <div className="bg-[#004189]/10 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2 text-[#C5161D]">OCR Text Extraction</h3>
            <p className="text-gray-800">Extract all relevant data with high accuracy for downstream systems to consume.</p>
          </div>
          <div className="bg-[#004189]/10 p-6 rounded-xl shadow hover:scale-105 transition">
            <h3 className="font-semibold text-xl mb-2 text-[#C5161D]">Secure Environment</h3>
            <p className="text-gray-800">Runs in an isolated, bank-grade secured environment — no data leaks, guaranteed privacy.</p>
          </div>
        </div>
      </section>

      {/* Animated Video Section */}
      <section className="py-16 px-6 md:px-20 bg-[#004189]/10">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#004189]">See It In Action</h2>
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
      <section className="bg-[#004189] text-white py-16 text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Classify Documents the Smart Way?</h2>
        <p className="mb-6 text-lg text-white/90">Click below to begin your journey with intelligent automation.</p>
        <Button
          className="px-8 py-4 text-lg bg-[#C5161D] text-white hover:bg-[#b21318] cursor-pointer font-semibold"
          onClick={() => router.push('/login')}
        >
          Login
        </Button>
      </section>
    </main>
  );
}