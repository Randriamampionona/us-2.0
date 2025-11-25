"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
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

export default function Navbar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { isAllowed, setIsAllowed } = useSoundEffect();
  const { interval, setIntervalReminder } = useMessageReminder();
  const [open, setOpen] = useState(false);

  const showButton = pathname === "/chat";

  const onNavigate = (url: string) => {
    setOpen(false);
    redirect(url);
  };

  const onReload = () => {
    window.location.reload();
  };

  const onchangeReminder = (value: string) => {
    setIntervalReminder(value === "null" ? null : Number(value));
  };

  return (
    <nav className="fixed flex items-center justify-between w-full p-2 z-50 backdrop-blur-sm bg-transparent">
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
          <SignedIn>
            <UserButton />
          </SignedIn>
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
