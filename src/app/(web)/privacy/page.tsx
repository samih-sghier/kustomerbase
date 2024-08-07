import { WebPageWrapper } from "@/app/(web)/_components/general-components";
import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { useMDXComponents } from "mdx-components";
import { DocsBody } from "fumadocs-ui/page";
import { privacy } from "@/app/source";

export const dynamic = "force-static";

type PrivacyPolicyPageProps = {
    params: {
        slug: string[];
    };
};

export default async function PrivacyPolicyPage({ params }: PrivacyPolicyPageProps) {
    const privacyPolicy = privacy.getPage(params.slug);

    if (privacyPolicy == null) {
        notFound();
    }

    const MDX = privacyPolicy.data.exports.default;

    const components = useMDXComponents();

    return (
        <WebPageWrapper className="relative max-w-3xl flex-row items-start gap-8">
            <article className="w-full space-y-10">
                <div className="space-y-4">
                    <h1 className="scroll-m-20 font-heading text-4xl font-bold">
                        {privacyPolicy.data.title}
                    </h1>

                    {/* <div className="relative aspect-video max-h-[350px] w-full overflow-hidden rounded-md bg-muted/60">
                        <Image
                            src={privacyPolicy.data.title}
                            alt={privacyPolicy.data.title}
                            className="rounded-md"
                            fill
                        />
                    </div> */}

                    <p className="text-sm text-muted-foreground">
                        {format(new Date(privacyPolicy.data.publishedAt), "PPP")}
                    </p>

                    {privacyPolicy.data.exports.lastModified && (
                        <p className="text-sm text-muted-foreground">
                            Last updated at{" "}
                            {format(
                                new Date(privacyPolicy.data.exports.lastModified),
                                "PPP",
                            )}
                        </p>
                    )}
                </div>
                <DocsBody>
                    <MDX components={components} />
                </DocsBody>
            </article>
        </WebPageWrapper>
    );
}

export async function generateStaticParams() {
    return privacy.getPages().map((page) => ({
        slug: page.slugs,
    }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
    const page = privacy.getPage(params.slug);

    if (page == null) notFound();

    return {
        title: page.data.title,
        description: page.data.description,
    } satisfies Metadata;
}
