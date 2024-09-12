
import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { dashboardPageConfig } from "@/app/(app)/(user)/dashboard/_constants/page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ActivityIcon,
    CreditCardIcon,
    DollarSignIcon,
    Users2Icon,
    HomeIcon, // For Properties
    UsersIcon, // For Organization Members
    EyeIcon, // For Watch List
    ShieldIcon, // For Subscription Plan
    BarChartIcon // For Delinquency Score
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { siteUrls } from "@/config/urls";
import { redirect, useRouter } from "next/navigation";
import { getDashboardInfo } from "@/server/actions/dashboard/queries";
import { formatCurrency } from "date-fns";
import { getOrgSubscription } from "@/server/actions/stripe_subscription/query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function DashboardPage() {

    const dashInfo = await getDashboardInfo();
    const subscription = await getOrgSubscription();

    return (
        <AppPageShell
            title={dashboardPageConfig.title}
            description={dashboardPageConfig.description}
        >
            <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Rental Value
                            </CardTitle>
                            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashInfo.totalRent}</div>
                            <p className="text-xs text-muted-foreground">
                                +0.0% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                New Leads
                            </CardTitle>
                            <Users2Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashInfo.numberOfTenants}</div>
                            <p className="text-xs text-muted-foreground">
                                +0.0% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Alerts
                            </CardTitle>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {dashInfo.numberOfAlerts >= 0
                                    ? (dashInfo.numberOfAlerts > 0 ? `+${dashInfo.numberOfAlerts}` : dashInfo.numberOfAlerts)
                                    : "0"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +0.0% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Watch List
                            </CardTitle>
                            <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashInfo.numberWatchlist}</div>
                            <p className="text-xs text-muted-foreground">
                                +0.0% from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Organization Members
                            </CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashInfo.numberOfOrganizationMembers}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +10.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Properties
                            </CardTitle>
                            <HomeIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashInfo.numberOfProperties}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                    <Card className="relative">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Subscription Plan
                            </CardTitle>
                            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="relative pb-12"> {/* Add extra padding to bottom */}
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold">{subscription ? subscription.plan?.title : "Free"}</div>

                                {subscription?.status && (
                                    <Badge variant="secondary">
                                        {subscription.status}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {subscription ? (
                                    <>
                                        {subscription.status === "active" &&
                                            "Renews at " +
                                            format(subscription.renews_at, "PP")}

                                        {subscription.status === "paused" &&
                                            "Your subscription is paused"}

                                        {subscription.status === "canceled" &&
                                            subscription.ends_at &&
                                            `${new Date(subscription.ends_at) >
                                                new Date()
                                                ? "Ends at "
                                                : "Ended on "
                                            }` + format(subscription.ends_at, "PP")}
                                    </>
                                ) : (
                                    "No expiration"
                                )}
                            </p>

                            {/* <div className="absolute bottom-4 right-4">
                                <Button>
                                    Manage
                                </Button>
                            </div> */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Delinquency Score
                            </CardTitle>
                            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0%</div>
                            <p className="text-xs text-muted-foreground">
                                +0% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* 
                <div className="flex min-h-44 w-full items-center justify-center rounded-md border-2 border-dashed border-border p-4">
                    <p className="text-sm text-muted-foreground">
                        Your Content here, Above is a dummy data
                    </p>
                </div> */}
            </div>
        </AppPageShell >
    );
}
