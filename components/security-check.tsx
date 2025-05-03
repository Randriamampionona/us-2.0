import { security } from "@/action/security.action";
import { redirect } from "next/navigation";

export default async function SecurityCheckPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAllowed = await security();

  if (!isAllowed) {
    redirect("/not-allowed");
  }

  return <>{children}</>;
}
