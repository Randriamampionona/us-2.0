import { getSubscriptions } from "@/action/get-subscriptions.action";
import { currentUser } from "@clerk/nextjs/server";

export default async function AmdinPage() {
  const user = await currentUser();

  if (!user || !user.id) {
    return <div>Unauthorized</div>;
  }

  const subscriptions = await getSubscriptions(user.id);

  return (
    <div>
      AmdinPage
      <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
    </div>
  );
}
