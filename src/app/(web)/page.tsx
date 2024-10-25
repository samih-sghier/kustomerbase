import Features from "@/app/(web)/_components/features";
import {
    WebPageHeader,
    WebPageWrapper,
} from "@/app/(web)/_components/general-components";
import { Promotion } from "@/app/(web)/_components/promotion";
import { Testimonials } from "@/app/(web)/_components/testimonials";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import type { Metadata } from "next";
import { ArrowRightIcon } from "lucide-react";
import HowItWorks from "@/app/(web)/_components/howitworks";

export const metadata: Metadata = {
    title: "Custom ChatGPT for your data",
};

export const dynamic = "force-static";

export default async function HomePage() {
    return (
        <WebPageWrapper>
            <WebPageHeader
                badge="Focus on what matters"
                title={`Custom ChatGPT for your Inbox`}
            >
                <Balancer
                    as="p"
                    className="text-center text-base text-muted-foreground sm:text-lg"
                >
                    Build a custom GPT, connect it to your email and let it handle customer support, lead generation, engage with your users, incoming support requests, reply to internal technical queries and more.
                </Balancer>

                <div className="flex items-center gap-2">
                    {/* <Link
                        href={siteUrls.github}
                        className={buttonVariants({ variant: "outline" })}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icons.gitHub className="mr-2 h-4 w-4" /> Github
                    </Link> */}

                    <Link
                        href={siteUrls.auth.login}
                        className={buttonVariants({
                            className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
                        })}
                    >
                        Automate your emails 🤖
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>

                </div>
            </WebPageHeader>

            <div className="-m-2 w-full rounded-xl bg-foreground/5 p-2 ring-1 ring-inset ring-foreground/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="relative aspect-video w-full rounded-md bg-muted">
                    <Image
                        src="https://utfs.io/f/z1SQx2HK8PtsaFzGPt8VkwuCAY9BKDHeQtXhMpfi8qSyO5xl"
                        alt="dashboard preview"
                        fill
                        className="block rounded-md border border-border dark:hidden"
                        priority
                    />

                    <Image
                        src="https://utfs.io/f/z1SQx2HK8PtsY15Q8uvaYyIlbV8gfnFD97GK6rEtwcUpWJx5"
                        alt="dashboard preview"
                        fill
                        className="hidden rounded-md border border-border dark:block"
                        priority
                    />
                </div>
            </div>

            <Promotion />
            <HowItWorks />
            <Features />
            <Testimonials />
        </WebPageWrapper>
    );
}
