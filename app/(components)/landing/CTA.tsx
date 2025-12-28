import { Button } from '@/components/ui/button'
import React from 'react'

function CTA() {
    return (
        <section className="mt-12">
            <div className="rounded-2xl bg-primary text-primary-foreground p-12 text-center space-y-6">
                <h2 className="text-3xl font-bold">
                    Ready to Stop Overpaying?
                </h2>
                <p className="max-w-xl mx-auto opacity-90">
                    Start tracking prices today and let the deals come to you.
                </p>
                <Button size="lg" variant="secondary">
                    Get Started Free
                </Button>
            </div>
        </section>
    )
}

export default CTA