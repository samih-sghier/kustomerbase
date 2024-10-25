import { Icons } from "@/components/ui/icons";
import { siteUrls } from "@/config/urls";
import Link from "next/link";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen w-screen grid-cols-1 px-4 lg:grid-cols-3">
            <main className="col-span-2 flex items-center justify-center">
                {children}
            </main>
            <section className="col-span-1 hidden flex-col items-start justify-center gap-6 border-l border-border bg-muted/30 p-10 lg:flex">
                <Icons.logo as="h3" />
                <h2 className="text-3xl font-medium">
                    Unlock the Future with AI
                </h2>
                <p className="font-light text-muted-foreground">
                    Your intelligent assistant is just a login away. Let's get started! 
                    <Link
                        href={siteUrls.subletguard}
                        className="font-medium text-foreground underline underline-offset-4"
                    >
                        bettereply.com
                    </Link>
                </p>
            </section>

        </div>
    );
}
