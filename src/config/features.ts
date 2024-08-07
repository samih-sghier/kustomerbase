/**
 * This file contains the features data for the features page.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and inludedIn to the new feature object. (inludedIn is an array of pricing plan ids that include this feature)
 * 3. Add description to the new feature object.
 * 4. Add image to the new feature object.
 * 5. Add imageDark to the new feature object. (optional)
 */

export type Feature = {
    title: string;
    description: string;
    image: string;
    imageDark?: string;
};

export const features: Feature[] = [
    {
        title: "Comprehensive Dashboard",
        description:
            "Our platform offers a comprehensive dashboard that provides landlords with an overview of property status, lease agreements, and tenant activities. Easily track and manage multiple properties from one central location.",
        image: "https://utfs.io/f/02eb2bb2-9910-422d-bc56-1d7e8dcac1ac-5w20ij.png",
        imageDark:
            "https://utfs.io/f/77743ecd-cb78-4a3b-b07e-4516baf51827-i57epb.png",
    },
    {
        title: "Lease Breach Alerts",
        description:
            "Set up customizable alerts to notify you of any potential breaches of lease agreements. Our system monitors lease conditions and sends timely notifications when discrepancies or violations are detected.",
        image: "https://utfs.io/f/30ef05da-6556-4b2f-9428-bf5b706f3bd4-xt0cyj.png",
        imageDark:
            "https://utfs.io/f/ed512354-67c6-43ba-808a-d0deefbef2ba-1ml5w4.png",
    },
    {
        title: "Lease Compliance Management",
        description:
            "Facilitate company-wide tracking and management of lease compliance. Our platform allows for centralized oversight, ensuring that all lease breaches are monitored and resolved efficiently across your organization.",
        image: "https://utfs.io/f/fcb52926-361c-4495-a790-3b5ee194ac62-aylp7x.png",
        imageDark:
            "https://utfs.io/f/b2dc6e98-3d27-4608-95ff-e017906a47e7-kyyxmn.png",
    },
    {
        title: "Property and Tenant Oversight",
        description:
            "Enable your entire team to efficiently manage and monitor multiple properties and tenants. Our platform supports bulk uploads and provides tools for effective tracking and oversight, ensuring streamlined operations and improved management.",
        image: "https://utfs.io/f/cdbaa3d7-59aa-43b2-aa89-e3c60066eb31-r1zhx8.png",
        imageDark:
            "https://utfs.io/f/92ca74f3-5b59-4d1c-a6cf-b701ca4ae866-h5eiiu.png",
    }
];
