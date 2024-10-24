/**
 * This file is used to store the testimonials for the homepage.
 * The testimonials are stored as an array of arrays of arrays.
 * Each array represents a column of testimonials.
 * Each inner array represents a row of testimonials.
 * Each testimonial is an object with a body and author property.
 *
 * @note add your testimonials evenly
 */

type Testimonial = {
    body: string;
    author: {
        name: string;
        handle: string;
        imageUrl: string;
        logoUrl?: string;
    };
};

export const featuredTestimonial: Testimonial = {
    body: "bettereply has been fantastic in helping us streamline our email management. The system catches potential issues early, so we can handle them before they escalate. It's made managing communications so much smoother!",
    author: {
        name: "Brenna",
        handle: "Pinnacle Property Pros",
        imageUrl:
            "https://plus.unsplash.com/premium_photo-1669075651198-674fab1370b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmVhbCUyMGVzdGF0ZSUyMGNvbXBhbnklMjBsb2dvfGVufDB8fDB8fHww",
        logoUrl: "https://tailwindui.com/img/logos/savvycal-logo-gray-900.svg",
    },
};

export const testimonials: Testimonial[][][] = [
    [
        [
            {
                body: "bettereply has been instrumental in ensuring our email communications are efficient and effective. Their platform is easy to use and highly effective.",
                author: {
                    name: "Leslie",
                    handle: "Urban Nest Realty",
                    imageUrl:
                        "https://utfs.io/f/e9364a67-9c41-421d-bb94-b7101f618d1f-1uet02.png",
                },
            },
            // More testimonials...
        ],
        [
            {
                body: "bettereply has revolutionized how we handle email responses. It's a must-have for any business serious about customer engagement.",
                author: {
                    name: "Jessica",
                    handle: "Walton Properties LLC",
                    imageUrl:
                        "https://static.wixstatic.com/media/cea8c0_365d1486f5204ccbbb40e3b77e591dc4~mv2.jpg/v1/fill/w_600,h_362,al_c,lg_1,q_80,enc_auto/cea8c0_365d1486f5204ccbbb40e3b77e591dc4~mv2.jpg",
                },
            },
            // More testimonials...
        ],
    ],
    [
        [
            {
                body: "Thanks to bettereply, managing our email communications has become much smoother. Their platform ensures we stay responsive without hassle.",
                author: {
                    name: "Tom",
                    handle: "Greenfield Estates",
                    imageUrl:
                        "https://utfs.io/f/e6ed2635-d6e0-4acf-abb9-3466525c819e-5hoeg9.jpg",
                },
            },
            // More testimonials...
        ],
        [
            {
                body: "bettereply has been a game-changer for us. It's simplified our operations and ensured our communications are always timely.",
                author: {
                    name: "Leonard",
                    handle: "Horizon Haven Realty",
                    imageUrl:
                        "https://utfs.io/f/291a4aa7-892f-4eb3-be3b-0661fbc665c7-i5ejyz.jpg",
                },
            },
            // More testimonials...
        ],
    ],
];
