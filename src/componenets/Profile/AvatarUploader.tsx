import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserStore, type CurrentUser } from "@/zustand/userStore";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export function AvatarUploader({ user }: { user: CurrentUser }) {
  const { uploadAvatar, removeAvatar } = useUserStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PNG, JPEG, WEBP, and GIF images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setError("");
    setIsUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setError("");
    setIsUploading(true);
    try {
      await removeAvatar();
    } catch {
      setError("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="text-lg">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="bg-white/5 border-white/15 text-white hover:bg-white/10"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Change photo
          </Button>
          {user.avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading}
              className="text-white/60 hover:text-red-400"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-white/50">PNG, JPEG, WEBP, or GIF. Max 5MB.</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
