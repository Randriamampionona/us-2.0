import toast from "react-hot-toast";

type ToastVariant = "success" | "error" | "loading"; // Define only the methods you want to use

export function toastify(type: ToastVariant = "success", message: string) {
  const toastMap: Record<ToastVariant, (msg: string) => string> = {
    success: toast.success,
    error: toast.error,
    loading: toast.loading,
  };

  return toastMap[type](message);
}
