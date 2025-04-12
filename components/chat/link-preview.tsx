import { LinkIcon } from "lucide-react";
import Link from "next/link";

type TProps = {
  url: string;
};

export default function LinkPreviewer({ url }: TProps) {
  return (
    <Link
      href={url}
      prefetch={false}
      target="_blank"
      className="flex items-center justify-start space-x-2 whitespace-pre-line truncate"
    >
      <LinkIcon size={16} />
      <span>{url}</span>
    </Link>
  );
}
