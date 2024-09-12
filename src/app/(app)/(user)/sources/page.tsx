import { useEffect, useState } from "react";
import { AppPageShell } from "@/app/(app)/_components/page-shell";
import { propertiesPageConfig } from "@/app/(app)/(user)/sources/_constants/page-config";
import { CreatePropertyForm } from "@/app/(app)/(user)/sources/_components/create-property-form";
import { getOrgPropertiesQuery } from "@/server/actions/properties/queries";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PropertyDropdown } from "@/app/(app)/(user)/sources/_components/property-dropdown";
import WebsiteContent from "./_components/website-content";
import { TabsSection } from "./_components/tabs-section";
import { SourcesCard } from "./_components/sources-card";

export default async function UserPropertyPage() {
    const properties = await getOrgPropertiesQuery();

    // const totalChars = links.reduce((total, link) => total + link.chars, 0);

    const handleDeleteLink = (id) => {
        // setLinks(links.filter((link) => link.id !== id));
    };

    const handleDeleteAll = () => {
        // setLinks([]);
    };
    return (
        <AppPageShell
            title={propertiesPageConfig.title}
            description={propertiesPageConfig.description}
        >
            <div className="flex flex-col lg:flex-row lg:space-x-4">
                <div className="flex-1">
                    <TabsSection />
                </div>
                <div className="mt-4 lg:mt-0 lg:w-1/4">
                    <SourcesCard />
                </div>
            </div>
        </AppPageShell>
    );
}
