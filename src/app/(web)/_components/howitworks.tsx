import { cn } from "@/lib/utils";
import Image from "next/image";

export default function HowItWorks() {
    return (
        <section className="flex flex-col items-center justify-center gap-20 py-20">
            <div className="grid gap-3">
                <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
                    How It Works
                </h2>
                <p className="max-w-2xl text-center text-base text-muted-foreground sm:text-xl">
                    Follow these simple steps to get started with our platform.
                </p>
            </div>
            <div className="grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
                <StepCard number={1} title="Upload Your Property Data" />
                <StepCard number={2} title="Upload Your Tenant Information" />
                <StepCard number={3} title="Create a Watch List Item" />
                <StepCard number={4} title="Receive Alerts for Illegal Subleasing and Complaints" />
            </div>
        </section>
    );
}

type StepCardProps = {
    number: number;
    title: string;
};

function StepCard({ number, title }: StepCardProps) {
    return (
        <div className="grid gap-4 rounded-[25px] border border-border bg-muted/50 p-6 transition-colors duration-300 hover:bg-muted/20 dark:bg-muted/70 dark:border-dark-border">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full text-primary-dark dark:bg-primary-dark dark:text-primary-light">
                    <span className="text-2xl font-bold">{number}</span>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-foreground dark:text-foreground-dark">
                        {title}
                    </h3>
                </div>
            </div>
        </div>
    );
}
