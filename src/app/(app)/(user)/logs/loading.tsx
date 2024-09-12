import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { watchListPageConfig } from "./_constants/page-config";

export default function OrgMembersLoading() {
    return (
        <AppPageLoading
            title={watchListPageConfig.title}
            description={watchListPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
