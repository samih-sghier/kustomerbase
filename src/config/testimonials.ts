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
    body: "SubletGuard has been fantastic in helping us prevent lease breaches and avoid costly litigation. The system catches potential issues early, so we can handle them before they escalate. It's made managing properties so much smoother!",
    author: {
        name: "Brenna Goyette",
        handle: "brennagoyette",
        imageUrl:
            "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=1024&h=1024&q=80",
        logoUrl: "https://tailwindui.com/img/logos/savvycal-logo-gray-900.svg",
    },
};



export const testimonials: Testimonial[][][] = [
    [
        [
            {
                body: "SubletGuard has been instrumental in ensuring our properties remain compliant and secure. Their platform is easy to use and highly effective.",
                author: {
                    name: "Leslie",
                    handle: "alexanderrealty",
                    imageUrl:
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            {
                body: "We've significantly reduced the risk of unauthorized subleasing thanks to SubletGuard. Their service is invaluable for property management.",
                author: {
                    name: "Lindsay",
                    handle: "waltonproperty",
                    imageUrl:
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
        [
            {
                body: "SubletGuard has revolutionized how we handle subleasing issues. It's a must-have for any property manager serious about compliance.",
                author: {
                    name: "Lindsay",
                    handle: "waltonproperty",
                    imageUrl:
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
    ],
    [
        [
            {
                body: "Thanks to SubletGuard, managing our rental properties has become much smoother. Their platform ensures we stay compliant without hassle.",
                author: {
                    name: "Tom",
                    handle: "cookrealestate",
                    imageUrl:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },

            // More testimonials...
        ],
        [
            {
                body: "SubletGuard has been a game-changer for us. It's simplified our operations and ensured our properties are always in compliance.",
                author: {
                    name: "Leonard",
                    handle: "krasnerproperties",
                    imageUrl:
                        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            {
                body: "Thanks to SubletGuard, managing our rental properties has become much smoother. Their platform ensures we stay compliant without hassle.",
                author: {
                    name: "Tom",
                    handle: "cookrealestate",
                    imageUrl:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                },
            },
            // More testimonials...
        ],
    ],
];


