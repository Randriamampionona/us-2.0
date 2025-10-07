import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Adjust path as needed
import { CHATCOLECTION_DEV, CHATCOLECTION_PROD } from "@/constant";

const CHATCOLECTION =
  process.env.NODE_ENV === "development"
    ? CHATCOLECTION_DEV
    : CHATCOLECTION_PROD;

export async function unsentMessage(message_id: string) {
  try {
    const docRef = doc(db, CHATCOLECTION, message_id);

    await updateDoc(docRef, {
      is_deleted: true,
    });

    // await deleteDoc(doc(db, CHATCOLECTION, message_id));
    console.log(`Document ${CHATCOLECTION} deleted`);
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}
