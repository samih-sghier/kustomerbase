import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SourcesCard() {
    const totalCharacters = 18497; // Replace with dynamic calculation
    const totalLinks = 5; // Replace with dynamic calculation
    const limit = 400000;

    return (
        <Card className="w-full lg:w-100 shadow-md rounded-md border border-gray-200 bg-white p-4">
            <CardContent>
                <div className="text-sm font-medium mb-4">Sources</div>
                <div className="text-xs text-muted-foreground mb-6 space-y-2">
                    <p>{totalCharacters} text input chars</p>
                    <p>{totalLinks} Links (15,657 detected chars)</p>
                    <p className="font-bold text-black">Total detected characters</p>
                    <p className="font-bold text-lg">
                        {totalCharacters} / {limit} limit
                    </p>
                </div>
                <Button className="w-full">
                    Retrain Chatbot
                </Button>
            </CardContent>
        </Card>
    );
}
