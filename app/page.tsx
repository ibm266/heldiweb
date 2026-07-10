import { HeldiHomepage } from "@/components/heldi-homepage";

export default function Home() {
  return (
    <HeldiHomepage
      grams={10}
      heroAnimation="split-flap"
      flapDwellMs={2200}
      ticker
    />
  );
}
