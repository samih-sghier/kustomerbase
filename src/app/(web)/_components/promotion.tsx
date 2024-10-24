import Balancer from "react-wrap-balancer";

export function Promotion() {
    return (
        <section className="flex min-h-96 w-full flex-col items-center justify-center gap-5 rounded-[26px] bg-foreground p-8 py-10 text-background">
            <Balancer
                as="h2"
                className="text-center font-heading text-3xl font-bold md:text-5xl"
            >
                Streamline Your Email Management with bettereply!
            </Balancer>
            <Balancer
                as="p"
                className="text-center text-base leading-relaxed text-background/70 sm:text-xl"
            >
                bettereply transforms your inbox by intelligently responding to all types of emails. Whether it's customer inquiries, team communications, or important notifications, our AI assistant uses your data to provide timely and relevant replies. Simplify your email management and enhance your productivity today!
                <br />
                <br />
            </Balancer>
        </section>
    );
}
