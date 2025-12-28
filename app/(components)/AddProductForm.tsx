"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { DialogDemo } from './DialogDemo'
import { addProduct } from '../actions'
import { toast } from 'sonner'

function AddProductForm({ user }: { user: User | null }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            setShowAuthModal(true);
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("url", url);

        const result = await addProduct(formData);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || "Product tracked successfully!");
            setUrl("");
        }

        setLoading(false);


    }



    return (
        <>
            <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
                <div className="flex my-12 flex-col sm:flex-row gap-2">
                    <Input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste product URL (Amazon, Walmart, etc.)"
                        className="h-12 text-base"
                        required
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className=" h-10 sm:h-12 px-8"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Start Tracking"
                        )}
                    </Button>
                </div>
            </form>

            <DialogDemo
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />

        </>
    )
}

export default AddProductForm