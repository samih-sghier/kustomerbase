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
    title: "Protect Your Rentals, Detect Unauthorized Subleases!",
};

export const dynamic = "force-static";

export default async function HomePage() {
    return (
        <WebPageWrapper>
            <WebPageHeader
                badge="Stay in Control"
                title={`Monitor Rentals`}
            >
                <Balancer
                    as="p"
                    className="text-center text-base text-muted-foreground sm:text-lg"
                >
                    Detect unauthorized subleasing and stay secure. Ideal for landlords and tenants with N12 or notice to vacate. Easy, reliable, real-time monitoring.
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
                        className={buttonVariants()}
                    >
                        Get Alerts Now 🚨
                        <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Link>

                </div>
            </WebPageHeader>

            <div className="-m-2 w-full rounded-xl bg-foreground/5 p-2 ring-1 ring-inset ring-foreground/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <div className="relative aspect-video w-full rounded-md bg-muted">
                    <Image
                        src="https://utfs.io/f/02eb2bb2-9910-422d-bc56-1d7e8dcac1ac-5w20ij.png"
                        alt="dashboard preview"
                        fill
                        className="block rounded-md border border-border dark:hidden"
                        priority
                    />

                    <Image
                        src="https://utfs.io/f/77743ecd-cb78-4a3b-b07e-4516baf51827-i57epb.png"
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
