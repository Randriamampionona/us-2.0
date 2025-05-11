import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";
import { TReaction } from "@/typing";
import { notificationTrigger } from "./notification-trigger.action";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

type TData = {
  message_id: string;
  reactionData: TReaction;
  isRemove?: boolean;
};

export async function setReaction({
  message_id,
  reactionData,
  isRemove,
}: TData) {
  try {
    const docRef = doc(db, CHATCOLECTION, message_id);
    await updateDoc(docRef, {
      reaction: reactionData,
    });

    try {
      !isRemove &&
        (await notificationTrigger({
          data: reactionData,
          notificationType: "REACTION",
        }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error updating document:", error);
  }
}
