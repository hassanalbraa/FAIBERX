"use client";

import { Share2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";


export function ShareButton({ variant = "ghost", size = "icon", className, ...props }: ButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: `ألق نظرة على هذا الموقع: ${document.title}`,
      url: window.location.origin, // Use origin to share the base URL
    };

    try {
      // Use Web Share API if available (common on mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard for desktop
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "تم نسخ رابط الموقع!",
          description: "يمكنك الآن لصق الرابط ومشاركته.",
        });
      }
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
      // Fallback for very old browsers or if clipboard fails
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "تم نسخ رابط الموقع!",
          description: "يمكنك الآن لصق الرابط ومشاركته.",
        });
      } catch (copyError) {
         toast({
          variant: "destructive",
          title: "فشلت المشاركة",
          description: "لم نتمكن من نسخ الرابط تلقائيًا.",
        });
      }
    }
  };

  if (variant === 'link') {
    return (
       <button onClick={handleShare} className={cn("text-sm text-muted-foreground hover:text-foreground p-0 h-auto", className)}>
            مشاركة الموقع
        </button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} onClick={handleShare} className={className} {...props}>
            <Share2 className="h-5 w-5" />
            <span className="sr-only">مشاركة الموقع</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>مشاركة رابط الموقع</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
