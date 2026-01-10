"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

     const res = await fetch("/api/scan-receipt", {
  method: "POST",
  body: formData,
});


      if (!res.ok) {
        throw new Error("Scan failed");
      }

      const data = await res.json();
      onScanComplete(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleScan(file);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            Scanning Receipt...
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            Scan Receipt with AI
          </>
        )}
      </Button>
    </div>
  );
}
