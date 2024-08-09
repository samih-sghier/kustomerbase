import { alertTypeEnum } from '@/server/db/schema';
import React from 'react';
import { create } from 'zustand';

interface LoadingBarState {
    isLoading: boolean;
    progress: number;
    currentPlatformIndex: number;
    alertType: string;
    setLoading: (loading: boolean) => void;
    setProgress: (progress: number) => void;
    setCurrentPlatformIndex: (index: number) => void;
    setAlertType: (alert: string) => void;
}

export const useLoadingBarStore = create<LoadingBarState>(set => ({
    isLoading: false,
    progress: 0,
    currentPlatformIndex: 0,
    alertType: 'Subleasing',
    setLoading: (loading) => set({ isLoading: loading }),
    setProgress: (progress) => set({ progress }),
    setCurrentPlatformIndex: (index) => set({ currentPlatformIndex: index }),
    setAlertType: (alert: string) => set({ alertType: alert }),

}));

export const rentalPlatforms = [
    "Airbnb",
    "Zillow",
    "Facebook Marketplace",
    "Craigslist",
    "Apartments.com",
    "+1,000 Real Estate Marketplace Platforms"
];

export const governmentPlatforms = [
    "Court Records",
    "Civil Case Records",
    "Landlord-Tenant Dispute Records",
    "Property Code Violations",
    "Building Permits",
    "Eviction Records",
    "Consumer Protection Complaints",
    "Health and Safety Violations",
    "Foreclosure Records",
    "Municipal Code Enforcement",
    "Housing Authority Records",
    "Tenant Rights Organizations",
    "Insurance Claims Records"
];

export function LoadingBar() {
    const { isLoading, progress, currentPlatformIndex, alertType } = useLoadingBarStore(state => ({
        isLoading: state.isLoading,
        progress: state.progress,
        currentPlatformIndex: state.currentPlatformIndex,
        alertType: state.alertType
    }));

    if (!isLoading) return null;

    const platforms = alertType === 'Court Complaints' ? governmentPlatforms : rentalPlatforms;
    const currentPlatform = platforms[currentPlatformIndex] || "Scanning";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="relative w-full max-w-md p-6 bg-background rounded-lg shadow-md border border-gray-300">
                <div className="mb-6">
                    <div className="relative h-2 bg-gray-200 rounded-full">
                        <div
                            className="absolute h-full bg-green-500 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="text-center text-sm font-medium">
                    {progress < 100
                        ? `Scanning ${currentPlatform}...`
                        : "Completed"}
                </div>
            </div>
        </div>
    );
}

