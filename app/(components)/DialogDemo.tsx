import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client";
import { X } from "lucide-react";


function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.23 9.21 3.64l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.14-3.09-.4-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 5.99C44.73 37.7 46.98 31.66 46.98 24.55z" />
            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.73-5.99c-2.15 1.45-4.9 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}
export function DialogDemo({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

    const supabase = createClient();
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "/",
            },
        });

        if (error) {
            console.error("Google login error:", error.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] rounded-2xl p-6">

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <DialogHeader className="space-y-2 text-center">
                    <DialogTitle className="text-2xl font-bold">
                        Sign in
                    </DialogTitle>
                    <DialogDescription>
                        Continue to your account to track prices
                    </DialogDescription>
                </DialogHeader>

                {/* Actions */}
                <div className="mt-6 space-y-4">
                    <Button onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 py-6 text-base"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        By continuing, you agree to our Terms & Privacy Policy.
                    </p>
                </div>

            </DialogContent>
        </Dialog>
    );
}
