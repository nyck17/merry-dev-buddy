import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-900 group-[.toaster]:text-zinc-100 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-zinc-400 text-xs",
          actionButton: "group-[.toast]:bg-violet-600 group-[.toast]:text-white group-[.toast]:hover:bg-violet-700 group-[.toast]:transition-colors group-[.toast]:px-3 group-[.toast]:h-8 group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400",
          success: "group-[.toaster]:border-emerald-500/50 group-[.toaster]:bg-emerald-500/5",
          error: "group-[.toaster]:border-red-500/50 group-[.toaster]:bg-red-500/5",
          info: "group-[.toaster]:border-blue-500/50 group-[.toaster]:bg-blue-500/5",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        error: <XCircle className="h-5 w-5 text-red-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />,
      }}
      duration={4000}
      visibleToasts={3}
      {...props}
    />
  );
};

export { Toaster };
