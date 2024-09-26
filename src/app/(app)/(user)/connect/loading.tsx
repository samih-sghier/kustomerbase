import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { tenantsPageConfig } from "./_constants/page-config";

export default function DashboardLoading() {
    return (
        <AppPageLoading
            title={tenantsPageConfig.title}
            description={tenantsPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
