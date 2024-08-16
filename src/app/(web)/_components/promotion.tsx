import Balancer from "react-wrap-balancer";

export function Promotion() {
    return (

        <section className="flex min-h-96 w-full flex-col items-center justify-center gap-5 rounded-[26px] bg-foreground p-8 py-10 text-background">
            <Balancer
                as="h2"
                className="text-center font-heading text-3xl font-bold md:text-5xl"
            >
                Stop squatters and save money on costly legal battles with SubletGuard.
            </Balancer>
            <Balancer
                as="p"
                className="text-center text-base leading-relaxed text-background/70 sm:text-xl"
            >
                We actively monitor major real estate platforms like Airbnb and Zillow, as well as social media, to detect if your property is listed without your permission. Receive instant alerts and detailed reports to keep your rental properties secure and compliant.
                <br />
                <br />
                {/* <span className="rounded-[10px] bg-background p-1 font-semibold text-foreground">
                    Get Started Today
                </span> */}
            </Balancer>
        </section>



    );
}
