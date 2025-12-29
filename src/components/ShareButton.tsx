"use client";

import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export function ShareButton() {
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleShare}>
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
