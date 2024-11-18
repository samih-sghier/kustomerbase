import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { type ElementType } from "react";
import Balancer from "react-wrap-balancer";

// This is a page wrapper used in all public web pages
export function WebPageWrapper({
    children,
    as,
    className,
}: {
    children: React.ReactNode;
    as?: ElementType;
    className?: string;
}) {
    const Comp: ElementType = as ?? "main";

    return (
        <Comp
            className={cn(
                "container flex flex-col items-center justify-center gap-24 py-10",
                className,
            )}
        >
            {children}
        </Comp>
    );
}

// This is a page heading used in all public web pages
export function WebPageHeader({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-5">
            {badge && (

                <p className="bg-gradient-to-r from-[#807280] via-[#5C4A5B] to-[#603060] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4 mr-1 inline-block" />

                    {badge}
                </p>
            )}
            <Balancer
                as="h1"
                className="max-w-2xl text-center font-heading text-6xl font-bold leading-none sm:text-7xl"
            >
                {title.split(" ").slice(0, -2).join(" ")}
                <span className="bg-gradient-to-r from-[#807280] via-[#5C4A5B] to-[#603060] bg-clip-text text-transparent">
                    {" " + title.split(" ").slice(-2).join(" ")}
                </span>
            </Balancer>

            {children && children}
        </div>
    );
}
