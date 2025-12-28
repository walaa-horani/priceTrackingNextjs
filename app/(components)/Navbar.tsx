"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DialogDemo } from "./DialogDemo";
import { signOut } from "../actions";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
    const [showModal, setShowModal] = useState(false)
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);



    return (
        <>
            <header className="w-full border-b bg-background">
                <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={150} height={150} />
                    </Link>
                    {!user ? (
                        <Button onClick={() => setShowModal(true)}>Sign In</Button>
                    ) : (
                        <form action={signOut}>
                            <Button variant="ghost" type="submit">
                                Sign Out
                            </Button>
                        </form>
                    )}

                </div>
            </header>
            {/* Login Modal */}
            <DialogDemo
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>


    );
}
