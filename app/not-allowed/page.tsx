import BannerUnit from "@/components/ad/banner-unit";
import { LockKeyhole } from "lucide-react";

export default function NotAllowedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6 text-red-500">
          <LockKeyhole className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 text-lg">
          You do not have permission to view this page or access this content.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          If you believe this is a mistake, please reach me at{" "}
          <a
            href="mailto:tojorandria474@gmail.com"
            className="text-blue-600 hover:underline"
          >
            tojorandria474@gmail.com
          </a>
          .
        </p>
        <BannerUnit />
      </div>
    </div>
  );
}
