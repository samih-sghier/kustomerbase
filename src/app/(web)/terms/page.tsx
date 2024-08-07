import { WebPageWrapper } from "@/app/(web)/_components/general-components";
import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { useMDXComponents } from "mdx-components";
import { DocsBody } from "fumadocs-ui/page";
import { terms } from "@/app/source";

export const dynamic = "force-static";

type TermsOfServicePageProps = {
    params: {
        slug: string[];
    };
};

export default async function TermsOfServicePage({ params }: TermsOfServicePageProps) {
    const termsOfService = terms.getPage(params.slug);

    if (termsOfService == null) {
        notFound();
    }

    const MDX = termsOfService.data.exports.default;

    const components = useMDXComponents();

    return (
        <WebPageWrapper className="relative max-w-3xl flex-row items-start gap-8">
            <article className="w-full space-y-10">
                <div className="space-y-4">
                    <h1 className="scroll-m-20 font-heading text-4xl font-bold">
                        {termsOfService.data.title}
                    </h1>

                    {/* <div className="relative aspect-video max-h-[350px] w-full overflow-hidden rounded-md bg-muted/60">
                        <Image
                            src={termsOfService.data.thumbnail}
                            alt={termsOfService.data.title}
                            className="rounded-md"
                            fill
                        />
                    </div> */}

                    <p className="text-sm text-muted-foreground">
                        {format(new Date(termsOfService.data.publishedAt), "PPP")}
                    </p>

                    {termsOfService.data.exports.lastModified && (
                        <p className="text-sm text-muted-foreground">
                            Last updated at{" "}
                            {format(
                                new Date(termsOfService.data.exports.lastModified),
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
    return terms.getPages().map((page) => ({
        slug: page.slugs,
    }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
    const page = terms.getPage(params.slug);

    if (page == null) notFound();

    return {
        title: page.data.title,
        description: page.data.description,
    } satisfies Metadata;
}
