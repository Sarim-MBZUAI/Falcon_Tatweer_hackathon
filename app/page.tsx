import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Benchmark } from "@/components/Benchmark";
import { Scores } from "@/components/Scores";
import { CriteriaSections } from "@/components/CriteriaSection";
import { Repo } from "@/components/Repo";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Benchmark />
      <Scores />
      <CriteriaSections />
      <Repo />
      <Footer />
    </main>
  );
}
