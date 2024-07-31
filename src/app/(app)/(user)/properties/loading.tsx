import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { propertiesPageConfig } from "./_constants/page-config";

export default function DashboardLoading() {
    return (
        <AppPageLoading
            title={propertiesPageConfig.title}
            description={propertiesPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
