import { Timestamp } from "firebase-admin/firestore";
import { UploadApiResponse } from "cloudinary";

type TReaction = {
  reactor_id: string;
  reaction: string;
} | null;

type TMessageDataToSend = {
  sender_id: string;
  username: string | null;
  message: string;
  reaction: TReaction;
  is_seen: boolean;
  is_deleted: boolean;
  asset?: UploadApiResponse;
};

type TMessage = {
  id: string;
  message: string;
  sender_id: string;
  username: string;
  timestamp: Timestamp;
  editedAt?: Timestamp;
  reaction: TReaction;
  is_seen: boolean;
  is_deleted: boolean;
  asset?: UploadApiResponse;
};

type TMessages = Message[];
