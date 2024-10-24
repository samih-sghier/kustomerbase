import { Montserrat, Open_Sans } from "next/font/google";

export const fontSans = Montserrat({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const fontHeading = Open_Sans({
    subsets: ["latin"],
    variable: "--font-heading",
});
