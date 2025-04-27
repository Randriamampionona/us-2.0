import { Timestamp } from "firebase-admin/firestore";
import { UploadApiResponse } from "cloudinary";
import { TenorImage } from "gif-picker-react";

type TReaction = {
  reactor_id: string;
  reactor_username: string;
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
  gif?: TenorImage;
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
  gif?: TenorImage;
};

type TMessages = Message[];

type TUser = {
  id: string;
  username: string;
  active: true;
  typing: false;
  subscription?: {
    endpoint: string;
    keys: {
      auth: string;
      p256dh: string;
    };
  };
};
