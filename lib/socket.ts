import { io } from "socket.io-client";

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
export const socket = io(NEXT_PUBLIC_SERVER_URL);
