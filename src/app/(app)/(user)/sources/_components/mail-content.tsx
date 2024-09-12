"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
    DialogFooter,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

// Types for better readability
type Provider = "google" | "outlook";
type Account = string;

const mockAccounts = {
    google: ["support@subletguard.com"] as Account[],
    outlook: ["sales@yo.com"] as Account[],
};

export function MailContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [accounts, setAccounts] = useState(mockAccounts);
    const [isOpen, setIsOpen] = useState(false);
    const [actionType, setActionType] = useState<'connect' | 'disconnect' | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);

    const handleConnect = async (provider: Provider) => {
        setIsLoading(true);
        try {
            // Simulate account connection (replace with real OAuth flow)
            const accountInfo = `user${Math.floor(Math.random() * 100)}@${provider}.com`;
            await signIn(provider, {
                callbackUrl: "/dashboard",
                redirect: true,
            });
            setAccounts(prev => ({
                ...prev,
                [provider]: [...prev[provider], accountInfo]
            }));
            toast.success(`Connected ${provider} account.`);
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!provider || !selectedAccount) return;

        setIsLoading(true);
        try {
            await signOut({ redirect: false });
            setAccounts(prev => ({
                ...prev,
                [provider]: prev[provider].filter(acc => acc !== selectedAccount)
            }));
            toast.success(`${selectedAccount} disconnected successfully.`);
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const ProviderIcon = ({ provider }: { provider: Provider }) => {
        switch (provider) {
            case "google":
                return <Icons.google className="h-4 w-4 fill-foreground" />;
            case "outlook":
                return <Icons.microsoft className="h-4 w-4 fill-foreground" />;
            default:
                return null;
        }
    };

    const CombinedAccountList = () => {
        const combinedProviders = [
            ...accounts.google.map(account => ({ account, provider: 'google' })),
            ...accounts.outlook.map(account => ({ account, provider: 'outlook' }))
        ];

        return (
            <div className="flex flex-col space-y-2 mt-4">
                <p className="text-md font-medium">Connected Accounts:</p>
                {combinedProviders.length > 0 ? (
                    combinedProviders.map(({ account, provider }, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ProviderIcon provider={provider} />
                                <span>{account}</span>
                            </div>
                            <Button
                                onClick={() => {
                                    setSelectedAccount(account);
                                    setProvider(provider);
                                    setActionType('disconnect');
                                    setIsOpen(true);
                                }}
                                variant="outline"
                                className="w-auto gap-2 text-red-500"
                                disabled={isLoading}
                            >
                                <Cross2Icon className="h-4 w-4 fill-red-500" />
                                <span>Disconnect</span>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No accounts connected.</p>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col space-y-4">
            <p className="text-lg font-semibold mb-4">Manage Your Email Services</p>

            <div className="flex flex-col space-y-2">
                <Button
                    onClick={() => handleConnect('google')}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={isLoading}
                >
                    <Icons.google className="h-4 w-4 fill-foreground" />
                    <span>Connect Gmail</span>
                </Button>

                <Button
                    onClick={() => handleConnect('outlook')}
                    variant="outline"
                    className="w-full gap-2"
                    disabled={isLoading}
                >
                    <Icons.microsoft className="h-4 w-4 fill-foreground" />
                    <span>Connect Outlook</span>
                </Button>
            </div>

            {/* Combined list of connected accounts */}
            <CombinedAccountList />

            {/* Shared Confirmation Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button type="button" className="hidden">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent className="max-h-screen overflow-auto p-6 bg-white rounded-lg shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold mb-4">
                            {actionType === 'disconnect' ? 'Confirm Disconnection' : 'Connect Account'}
                        </DialogTitle>
                        <DialogDescription className="mb-4">
                            {actionType === 'disconnect'
                                ? `Are you sure you want to disconnect ${selectedAccount} from ${provider}?`
                                : 'Please follow the steps to connect your account.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        {actionType === 'disconnect' ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDisconnect}
                                    disabled={isLoading}
                                >
                                    Confirm
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (provider) handleConnect(provider);
                                    setIsOpen(false);
                                }}
                                disabled={isLoading}
                            >
                                Connect
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
