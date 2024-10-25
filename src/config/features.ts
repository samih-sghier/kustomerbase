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
        image: "https://utfs.io/f/z1SQx2HK8Pts5cduU1AQIzUY8AMwe6j3W50ZgkHiSoCGhyDd",
        imageDark: "https://utfs.io/f/z1SQx2HK8Pts5cduU1AQIzUY8AMwe6j3W50ZgkHiSoCGhyDd",
    },
    {
        title: "Lead Generation Engine",
        description:
            "Collect leads and gather your customer's data, all while providing a personalized experience.",
        image: "https://utfs.io/f/z1SQx2HK8Ptso3hlWWMn3BEhPA9ZYprzNyH56c2qKTGI0w4m",
        imageDark: "https://utfs.io/f/z1SQx2HK8Ptso3hlWWMn3BEhPA9ZYprzNyH56c2qKTGI0w4m",
    },
    {
        title: "Advanced Analytics",
        description:
            "Get insights into your mailbot’s interactions with your customers and use them to improve its performance.",
        image: "https://utfs.io/f/z1SQx2HK8PtsC1hTJXe6SR35l1wkCiN0WzFD7e9HZAyGV2YQ",
        imageDark: "https://utfs.io/f/z1SQx2HK8PtsC1hTJXe6SR35l1wkCiN0WzFD7e9HZAyGV2YQ",
    },
    {
        title: "Automated Escalations",
        description:
            "Get notified on your dashboard when an action is needed on your behalf. This ensures you never miss an important customer interaction.",
        image: "https://utfs.io/f/z1SQx2HK8PtsRG6mc3V9oHKBxCmPufZ1nq0YtySFUGD2beOd",
        imageDark: "https://utfs.io/f/z1SQx2HK8PtsRG6mc3V9oHKBxCmPufZ1nq0YtySFUGD2beOd",
    }
];
