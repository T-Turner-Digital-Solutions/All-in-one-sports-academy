import { auth } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/portal/AccountSettingsForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-3xl font-bold">Account Settings</h1>
      <ProfileForm
        firstName={session!.user.firstName}
        lastName={session!.user.lastName}
        phone={""}
      />
      <PasswordForm />
    </div>
  );
}
