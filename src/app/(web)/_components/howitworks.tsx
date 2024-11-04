"use client"; // Ensure this component is a Client Component

import { useState } from "react";

export default function HowItWorks() {
    const [expandedStep, setExpandedStep] = useState<number>(1); // Default to the first step expanded

    const steps = [
        { number: 1, title: "Import your data", description: "Connect your data sources, upload files, or add a website for crawling, and Inboxpilot will use all of that data to train your chatbot." },
        { number: 2, title: "Train the AI", description: "Use the uploaded data to train the AI, ensuring it understands your customer queries and responses." },
        { number: 3, title: "Connect your email account", description: "Link your email account to enable the AI to respond to customer queries directly." },
        { number: 4, title: "Sit back and relax", description: "Once everything is set up, let the AI handle customer queries while you focus on other tasks. You'll only need to address escalations that require your attention." },
    ];

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
            <div className="grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-1">
                {steps.map(step => (
                    <StepCard
                        key={step.number}
                        number={step.number}
                        title={step.title}
                        description={step.description} // Pass description to StepCard
                        isExpanded={expandedStep === step.number} // Check if this step is expanded
                        onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)} // Toggle expanded state
                    />
                ))}
            </div>
        </section>
    );
}

type StepCardProps = {
    number: number;
    title: string;
    description: string; // Add description prop
    isExpanded: boolean; // Add isExpanded prop
    onClick: () => void; // Add onClick prop
};






function StepCard({ number, title, description, isExpanded, onClick }: StepCardProps) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer grid gap-4 rounded-lg border border-border bg-muted/50 p-4 transition-colors duration-300 hover:bg-muted/20 dark:bg-muted/70 dark:border-dark-border" // Adjusted padding
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap"> {/* Added flex-wrap for better handling */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full text-primary-dark dark:bg-primary-dark dark:text-primary-light">
                        <span className="text-xl font-bold">{number}</span> {/* Adjusted font size */}
                    </div>
                    <h3 className="text-lg font-bold text-foreground dark:text-foreground-dark"> {/* Adjusted font size */}
                        {title}
                    </h3>
                </div>
                <span className="text-gray-500">{isExpanded ? '▼' : '►'}</span>
            </div>
            
            <div className={`mt-2 transition-all duration-300 ${isExpanded ? 'max-h-20' : 'max-h-0 overflow-hidden'}`}>
                <p className="text-base text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

