import { Inter, Bricolage_Grotesque } from "next/font/google";

export const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap", // Ensures fallback is shown while custom font loads
    fallback: ["sans-serif"],
});

export const fontHeading = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-heading",
    display: "swap",
    fallback: ["sans-serif"],
});
