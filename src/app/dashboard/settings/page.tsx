import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm, PasswordForm } from "@/components/portal/AccountSettingsForms";
import { HouseholdContactsSection } from "@/components/portal/HouseholdContactsSection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const [user, contacts] = await Promise.all([
    prisma.user.findUnique({ where: { id: session!.user.id } }),
    session!.user.householdId
      ? prisma.householdContact.findMany({ where: { householdId: session!.user.householdId }, orderBy: { createdAt: "asc" } })
      : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-3xl font-bold">Account Settings</h1>
      <ProfileForm firstName={user!.firstName} lastName={user!.lastName} phone={user!.phone ?? ""} />
      <PasswordForm />
      {session!.user.householdId ? (
        <HouseholdContactsSection householdId={session!.user.householdId} contacts={contacts} />
      ) : null}
    </div>
  );
}
