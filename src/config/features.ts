/**
 * This file contains the features data for the features page.
 *
 * @add a new feature, add a new object to the `features` array.
 * 1. Add id to the features object then use it as the id of the new feature object.
 * 2. Add title and includedIn to the new feature object. (includedIn is an array of pricing plan ids that include this feature)
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
        title: "Trustworthy, Accurate Responses",
        description:
            "With features like 'Revise responses' and 'Confidence score', you can be sure your AI assistant is providing the right answers.",
        image: "https://utfs.io/f/02eb2bb2-9910-422d-bc56-1d7e8dcac1ac-5w20ij.png",
        imageDark: "https://utfs.io/f/77743ecd-cb78-4a3b-b07e-4516baf51827-i57epb.png",
    },
    {
        title: "Lead Generation Engine",
        description:
            "Collect leads and gather your customer's data, all while providing a personalized experience.",
        image: "https://utfs.io/f/30ef05da-6556-4b2f-9428-bf5b706f3bd4-xt0cyj.png",
        imageDark: "https://utfs.io/f/ed512354-67c6-43ba-808a-d0deefbef2ba-1ml5w4.png",
    },
    {
        title: "Automated Customer Support",
        description:
            "Let bettereply handle customer queries while you focus on other tasks. Our system ensures timely and accurate responses, improving customer satisfaction.",
        image: "https://utfs.io/f/fcb52926-361c-4495-a790-3b5ee194ac62-aylp7x.png",
        imageDark: "https://utfs.io/f/b2dc6e98-3d27-4608-95ff-e017906a47e7-kyyxmn.png",
    },
    {
        title: "Automated Escalations",
        description:
            "Get notified on your dashboard when an action is needed on your behalf. This ensures you never miss an important customer interaction.",
        image: "https://utfs.io/f/cdbaa3d7-59aa-43b2-aa89-e3c60066eb31-r1zhx8.png",
        imageDark: "https://utfs.io/f/92ca74f3-5b59-4d1c-a6cf-b701ca4ae866-h5eiiu.png",
    }
];
