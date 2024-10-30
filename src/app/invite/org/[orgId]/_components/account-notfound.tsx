"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { siteUrls } from "@/config/urls";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPromptPage({ orgName }: { orgName: string }) {
    const router = useRouter();

    return (
        <main className="container flex min-h-screen flex-col items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader className="flex flex-col items-center space-y-3">
                    <CircleAlertIcon />
                    <CardTitle className="text-center text-xl">Account Required</CardTitle>
                    <CardDescription className="text-center">
                        You need an account to join {orgName}.
                    </CardDescription>
                    <CardDescription className="text-center font-semibold text-red-600">
                        Log in or create one, then click the invite link again to proceed.
                    </CardDescription>
                </CardHeader>


                <CardFooter>
                    <div className="flex w-full justify-center space-x-4">
                        <Button onClick={() => router.push(siteUrls.auth.login)}>
                            Log In
                        </Button>
                        <Button variant="outline" onClick={() => router.push(siteUrls.auth.signup)}>
                            Create Account
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </main>
    );
}
