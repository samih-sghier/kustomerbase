import { useEffect, useState } from "react";
import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { tenantsPageConfig } from "@/app/(app)/(user)/tenants/_constants/page-config";
import { CreateTenantForm } from "@/app/(app)/(user)/tenants/_components/create-tenants-form";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { TenantDropdown } from "@/app/(app)/(user)/tenants/_components/tenants-dropdown";
import Balancer from "react-wrap-balancer";
import { toast } from "sonner";
import { getOrgTenantsQuery } from "@/server/actions/tenants/queries";

export default async function UserTenantPage() {
    const tenants = await getOrgTenantsQuery();

    return (
        <AppPageShell
            title={tenantsPageConfig.title}
            description={tenantsPageConfig.description}
        >
            <div className="flex w-full items-start justify-between mb-6">
                <h2 className="text-base font-medium sm:text-lg">
                    {tenants.length} tenants you have added.
                </h2>

                <CreateTenantForm />
            </div>

            <div className={tenants.length > 0 ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
                {tenants.length > 0 ? (
                    tenants.map((tenant) => (
                        <Card key={tenant.id} className="relative shadow-md">
                            <TenantDropdown {...tenant} />
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div>
                                    <CardTitle className="text-xl font-semibold mb-2">{tenant.firstName}</CardTitle>
                                    <CardDescription className="text-sm mb-2">{tenant.email}</CardDescription>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                                        <p>Tenant since {format(new Date(tenant.createdAt), "PPP")}</p>
                                        {tenant.type && <Badge variant="background" className="w-fit">{tenant.type}</Badge>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-auto">
                                    <Badge
                                        variant={
                                            tenant.status === "Active"
                                                ? "success"
                                                : tenant.status === "Inactive"
                                                    ? "secondary"
                                                    : "info"
                                        }
                                        className="w-fit"
                                    >
                                        {tenant.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-4 py-10">
                        <p className="font-medium text-muted-foreground">No tenants found.</p>
                        <Balancer as="p" className="text-center text-muted-foreground">
                            Add a tenant using the form above, your tenants are important to us. 🏠
                        </Balancer>
                    </div>
                )}
            </div>
        </AppPageShell>
    );
}
