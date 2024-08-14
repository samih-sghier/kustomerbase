import { AppPageShell } from "@/app/(app)/_components/page-shell";
import type { SearchParams } from "@/types/data-table";
import { z } from "zod";
import { WatchListTable } from "./_components/watchlist-table";
import { watchListPageConfig } from "./_constants/page-config";
import { getAllPaginatedWatchlistTenantsQuery } from "@/server/actions/watchlist/queries";
import { CreateWatchlistForm } from "./_components/create-watchlist-form";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";
import { getOrgTenantsQuery } from "@/server/actions/tenants/queries";
import { getOrgSubscription } from "@/server/actions/stripe_subscription/query";

type WatchlistPageProps = {
    searchParams: SearchParams;
};

const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    tenantName: z.string().optional(),
    address: z.string().optional(),
    title: z.string().optional(),
    alertType: z.string().optional()
});

export default async function OrgMembersPage({ searchParams }: WatchlistPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    const membersPromise = getAllPaginatedWatchlistTenantsQuery(search);
    const properties = await getOrgPropertiesQuery();
    const tenants = await getOrgTenantsQuery();
    const subscription = await getOrgSubscription();

    return (
        <AppPageShell
            title={watchListPageConfig.title}
            description={watchListPageConfig.description}
        >
            <div className="flex w-full items-start justify-between mb-6">
                <h2 className="text-base font-medium sm:text-lg">
                    {(await membersPromise).data.length} items on watch.
                </h2>

                <CreateWatchlistForm subscription={subscription} />
            </div>
            <div className="w-full space-y-5">
                <WatchListTable
                    watchListPromise={membersPromise}
                    properties={properties}
                    tenants={tenants}
                />
            </div>
        </AppPageShell>
    );
}
