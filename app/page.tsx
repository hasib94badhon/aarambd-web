import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import HowItWorks from "@/components/home/HowItWorks";
import RecentPosts from "@/components/home/RecentPosts";
import CallToAction from "@/components/home/CallToAction";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0">
      <HeroSection />
      <StatsBar />
      <CategoryGrid />
      <HowItWorks />
      <RecentPosts />
      <CallToAction />
    </div>
  );
}
