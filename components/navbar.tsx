"use client";

import { SignedIn, UserButton, useAuth } from "@clerk/nextjs";

import { MessageSquareMore, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import UserStatus from "./user-status";
import { useSoundEffect } from "@/store/use-sound-effect.store";
import { useState } from "react";
import Link from "next/link";
import { usePathname, redirect } from "next/navigation";
import { useMessageReminder } from "@/store/use-message-reminder.store";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { resetNotification } from "@/action/reset-notification.action";
import { toastify } from "@/utils/toastify";

export default function Navbar() {
  const pathname = usePathname();
  const auth = useAuth();
  const { setTheme } = useTheme();
  const { isAllowed, setIsAllowed } = useSoundEffect();
  const { interval, setIntervalReminder } = useMessageReminder();
  const [open, setOpen] = useState(false);

  const isXmasSeason = new Date() <= new Date("2025-12-30T23:59:59");

  const showButton = pathname === "/chat";

  const onNavigate = (url: string) => {
    setOpen(false);
    redirect(url);
  };

  const onReload = () => {
    window.location.reload();
  };

  const onResetNotification = async () => {
    const user_id = auth?.userId;
    try {
      if (!user_id) {
        throw new Error("User not authenticated.");
      }
      const { success, error } = await resetNotification(user_id);
      if (!success) {
        throw new Error(error || "Failed to reset notification.");
      }
      toastify("success", "Notification subscriptions have been reset.");
    } catch (error: any) {
      toastify(
        "error",
        error.message || "An error occurred while resetting notifications."
      );
    } finally {
      // redirect("/admin");
      window.location.reload();
    }
  };

  const onchangeReminder = (value: string) => {
    setIntervalReminder(value === "null" ? null : Number(value));
  };

  return (
    <nav className="fixed flex items-center justify-between w-full p-2 z-50 backdrop-blur-sm bg-transparent">
      {isXmasSeason && (
        <DotLottieReact
          className="absolute top-0 left-0 pointer-events-none select-none"
          src="/animations/christmas-ornaments.lottie"
          loop={true}
          autoplay
        />
      )}

      <UserStatus />
      <div className="flex items-center justify-end gap-4">
        {!showButton && (
          <Button asChild>
            <Link href="/chat">
              <span>Go to chat</span> <MessageSquareMore />
            </Link>
          </Button>
        )}
        <div className="relative">
          <div className="relative">
            {isXmasSeason && (
              <DotLottieReact
                className="absolute top-[-9px] right-[-37px] z-10 w-28 h-auto pointer-events-none select-none"
                src="/animations/christmas-hat.lottie"
                loop={true}
                autoplay
                style={{ width: 75, height: 75 }}
              />
            )}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mr-2" align="start">
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onNavigate("/gallery")}>
                Our Gallery
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onReload}>Refresh</DropdownMenuItem>
              <DropdownMenuItem onClick={onResetNotification}>
                Reset Notification
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Preferences</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      Match System
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuItem
                className="flex justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <p>Sound effect</p>
                <Switch
                  defaultChecked={isAllowed}
                  className="data-[state=unchecked]:bg-foreground/25"
                  onCheckedChange={(checked) => setIsAllowed(checked)}
                />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex justify-between"
                onSelect={(e) => e.preventDefault()}
              >
                <p>Reminder</p>

                <Select
                  value={interval === null ? "null" : String(interval)}
                  onValueChange={onchangeReminder}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue
                      placeholder={interval ? `${interval} min` : "Off"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Off</SelectItem>
                    <SelectItem value="0.5">30 s</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} min
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
