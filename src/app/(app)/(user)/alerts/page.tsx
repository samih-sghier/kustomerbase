import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { alertsPageConfig } from "@/app/(app)/(user)/alerts/_constants/page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BellIcon,
    InboxIcon,
    ArchiveIcon,
} from "lucide-react";
import { AlertTable } from "./_components/alert-table";
import { SearchParams } from "@/types/data-table";
import { z } from "zod";
import { getAlertStatistics, getAllPaginatedAlertsQuery } from "@/server/actions/alert/queries";

type AlertsPageProps = {
    searchParams: SearchParams;
};

const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().default(10),
    sort: z.string().optional(),
    email: z.string().optional(),
    alertType: z.string().optional(), // Changed from 'status' to 'alertType'
    tenantName: z.string().optional(),
    address: z.string().optional(),
    title: z.string().optional(),
    organizationId: z.string().optional()
});

export default async function AlertsPage({ searchParams }: AlertsPageProps) {
    const search = searchParamsSchema.parse(searchParams);

    // Fetch the alerts using the new query function
    const alerts = getAllPaginatedAlertsQuery(search);
    const stats = await getAlertStatistics();

    return (
        <AppPageShell
            title={alertsPageConfig.title}
            description={alertsPageConfig.description}
        >
            <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                All Alerts
                            </CardTitle>
                            <BellIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                    <Card >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                New Alerts
                            </CardTitle>
                            <InboxIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className="text-2xl font-bold">{stats.newAlerts}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Archived Alerts
                            </CardTitle>
                            <ArchiveIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.archivedAlerts}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                0
                            </p> */}
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full space-y-5">
                    <AlertTable watchListPromise={alerts} />
                </div>
            </div>
        </AppPageShell>
    );
}
