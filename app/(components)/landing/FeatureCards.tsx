import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Store,
    BellRing,
    LayoutDashboard,
} from "lucide-react";

function FeatureCards() {
    const features = [
        {
            title: "Multi-Store Support",
            description: "Track prices from different e-commerce websites.",
            icon: Store,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
        },
        {
            title: "Custom Targets",
            description: "Set your desired price and wait for the alert.",
            icon: BellRing,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Clean Dashboard",
            description: "All tracked products in one simple interface.",
            icon: LayoutDashboard,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
        },
    ];

    return (
        <section className="container max-w-7xl mx-auto mt-12">
            <div className="grid gap-6 md:grid-cols-3">
                {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                        <Card
                            key={index}
                            className="transition hover:shadow-lg hover:-translate-y-1"
                        >
                            <CardHeader className="space-y-4 text-center">

                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${feature.bg}`}
                                >
                                    <Icon className={`w-6 h-6 ${feature.color}`} />
                                </div>

                                <CardTitle className="text-lg">
                                    {feature.title}
                                </CardTitle>

                                <CardDescription className="text-sm">
                                    {feature.description}
                                </CardDescription>

                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </section>


    );
}

export default FeatureCards;
