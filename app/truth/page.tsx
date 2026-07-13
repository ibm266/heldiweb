import type { Metadata } from "next";
import { SubpageFooter, SubpageNav } from "@/components/subpage-nav";
import { TruthPage } from "@/components/truth-page";

export const metadata: Metadata = {
  title: "The truth about protein in Indian food · Heldi",
  description:
    "A bowl of dal has 5 to 7g of protein, not 18. How much protein Indian food really has, why dal alone can't do the job, and how to close the gap."
};

export default function TruthRoute() {
  return (
    <main>
      <SubpageNav />
      <TruthPage />
      <SubpageFooter />
    </main>
  );
}
