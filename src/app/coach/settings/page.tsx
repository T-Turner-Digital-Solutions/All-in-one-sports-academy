import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm, PasswordForm } from "@/components/portal/AccountSettingsForms";
import { BioForm } from "./BioForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile & Settings" };

export default async function CoachSettingsPage() {
  const session = await auth();
  const coach = await prisma.coach.findUnique({ where: { id: session!.user.coachId! }, include: { user: true } });

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-3xl font-bold">Profile & Settings</h1>
      <ProfileForm firstName={coach!.user.firstName} lastName={coach!.user.lastName} phone={coach!.user.phone ?? ""} />
      <BioForm bio={coach!.bio ?? ""} />
      <PasswordForm />
    </div>
  );
}
