import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

function Hero() {
    return (
        <section className="container pt-28 text-center max-w-7xl mx-auto space-y-8">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
                Smarter Shopping Starts Here
            </span>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Track Prices. <br />
                Buy Smarter. Save Automatically.
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Monitor product prices across online stores and get notified
                when it’s the right time to buy.
            </p>


        </section>
    )
}

export default Hero