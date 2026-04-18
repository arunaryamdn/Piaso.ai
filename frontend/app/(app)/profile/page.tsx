import { auth } from "@/auth";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <ProfileClient
      name={user?.name ?? ""}
      email={user?.email ?? ""}
      image={user?.image ?? null}
      backendToken={(session as any)?.backendToken ?? ""}
    />
  );
}
