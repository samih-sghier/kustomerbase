import { useEffect, useState } from "react";
import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { propertiesPageConfig } from "@/app/(app)/(user)/properties/_constants/page-config";
import { CreatePropertyForm } from "@/app/(app)/(user)/properties/_components/create-property-form";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PropertyDropdown } from "@/app/(app)/(user)/properties/_components/property-dropdown";
import Balancer from "react-wrap-balancer";
import { getOrganizations } from "@/server/actions/organization/queries";
import { toast } from "sonner";

export default async function UserPropertyPage() {

    const properties = await getOrgPropertiesQuery();

    return (
        <AppPageShell
            title={propertiesPageConfig.title}
            description={propertiesPageConfig.description}
        >
            <div className="flex w-full items-start justify-between mb-6">
                <h2 className="text-base font-medium sm:text-lg">
                    {properties.length} properties you have created.
                </h2>

                <CreatePropertyForm />
            </div>

            <div className={properties.length > 0 ? "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
                {properties.length > 0 ? (
                    properties.map((property) => (
                        <Card key={property.id} className="relative shadow-md">
                            <PropertyDropdown {...property} />
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div>
                                    <CardTitle className="text-xl font-semibold mb-2">{property.title}</CardTitle>
                                    <CardDescription className="text-sm mb-2">{property.address}</CardDescription>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                                        <p>{format(new Date(property.createdAt), "PPP")}</p>
                                        {property.unitNumber && <Badge variant="background" className="w-fit">{property.unitNumber}</Badge>}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end mt-auto">
                                    <Badge
                                        variant={
                                            property.status === "Available"
                                                ? "success"
                                                : property.status === "Pending"
                                                    ? "info"
                                                    : "secondary"
                                        }
                                        className="w-fit"
                                    >
                                        {property.status}
                                    </Badge>
                                    <p className="text-lg font-semibold text-right">${property.price}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="flex w-full flex-col items-center justify-center gap-4 py-10">
                        <p className="font-medium text-muted-foreground">No properties found.</p>
                        <Balancer as="p" className="text-center text-muted-foreground">
                            Create a property using the form above, your properties are important to us. 🏠
                        </Balancer>
                    </div>


                )}
            </div>
        </AppPageShell>
    );
}
