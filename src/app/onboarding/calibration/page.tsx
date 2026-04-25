import { AppFrame } from "@/components/layout/app-frame";
import { CalibrationForm } from "@/components/onboarding/calibration-form";

export const metadata = {
  title: "Skill Calibration"
};

export default function CalibrationPage() {
  return (
    <AppFrame>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CalibrationForm />
      </main>
    </AppFrame>
  );
}
