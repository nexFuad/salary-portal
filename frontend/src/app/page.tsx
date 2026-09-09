import CtaSection from "@/Components/Landing/cta-section";
import DashboardPreview from "@/Components/Landing/dashboard-preview";
import Footer from "@/Components/Landing/footer";
import Hero from "@/Components/Landing/hero";
import Navbar from "@/Components/Landing/navbar";
import RoleBasedManagement from "@/Components/Landing/role-based-management";
import TrustedBy from "@/Components/Landing/trusted-by";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <RoleBasedManagement />
        <DashboardPreview />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
