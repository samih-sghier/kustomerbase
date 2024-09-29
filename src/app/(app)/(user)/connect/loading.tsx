import { AppPageLoading } from "@/app/(app)/_components/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { connectPageConfig } from "./_constants/page-config";

export default function DashboardLoading() {
    return (
        <AppPageLoading
            title={connectPageConfig.title}
            description={connectPageConfig.description}
        >
            <Skeleton className="h-96 w-full" />
        </AppPageLoading>
    );
}
