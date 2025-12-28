import * as React from "react"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

const FEATURE_IMAGES = [
    {
        src: "https://plus.unsplash.com/premium_photo-1664202525979-80d1da46b34b?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Shopping experience"
    },
    {
        src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Tech gadgets"
    },
    {
        src: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop",
        alt: "Fashion and apparel"
    },
    {
        src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
        alt: "Modern retail store"
    }
]

export function FeatureCarousel() {
    return (
        <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
                {FEATURE_IMAGES.map((image, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card className="overflow-hidden">
                                <CardContent className="flex aspect-video items-center justify-center p-0">
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        width={400}
                                        height={225}
                                        className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}
