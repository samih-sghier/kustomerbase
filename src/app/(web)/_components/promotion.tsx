import Balancer from "react-wrap-balancer";

export function Promotion() {
    return (
        <section className="flex min-h-96 w-full flex-col items-center justify-center gap-5 rounded-[26px] bg-gradient-to-t from-[#603060] via-[#5C4A5B] to-[#807280] p-8 py-10 text-white">
            <Balancer
                as="h2"
                className="text-center font-heading text-3xl font-bold md:text-5xl"
            >
                No More Ticket Pile-Ups!
            </Balancer>
            <Balancer
                as="p"
                className="text-center text-base leading-relaxed text-white sm:text-xl"
            >
                Transform your inbox by intelligently responding to all types of emails. Whether it's customer inquiries, team communications, or important notifications, our AI assistant uses your data to provide timely and relevant replies. Simplify your email management and enhance your productivity today!
                <br />
                <br />
            </Balancer>

        </section>

    );
}
