import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Navbar></Navbar>
      <main className="relative z-10">
        <HeroSection />
      </main>
    </div>
  );
}
