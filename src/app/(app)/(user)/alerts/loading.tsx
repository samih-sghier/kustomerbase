import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { dashboardPageConfig } from "@/app/(app)/(user)/dashboard/_constants/page-config";
import { Skeleton } from "@/components/ui/skeleton";
import { alertsPageConfig } from "./_constants/page-config";

export default function DashboardLoading() {
    return (
        <AppPageLoading
            title={alertsPageConfig.title}
            description={alertsPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
