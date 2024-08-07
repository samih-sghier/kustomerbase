import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { useController } from 'react-hook-form';
import type { Control, FieldValues } from 'react-hook-form';

interface GooglePlacesInputProps<T extends FieldValues> {
    name: string;
    control: Control<T>;
    label: string;
    description: string;
}

export function GooglePlacesInput<T extends FieldValues>({
    name,
    control,
    label,
    description,
}: GooglePlacesInputProps<T>) {
    const { field } = useController({ name, control });
    const { field: placeIdField } = useController({ name: "placeId", control });

    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [autocompletePredictions, setAutocompletePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [inputValue, setInputValue] = useState<string>(field.value || '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleScriptLoad = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                const service = new google.maps.places.AutocompleteService();
                setAutocompleteService(service);
            } else {
                setError('Google Maps API script failed to load.');
            }
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
        script.onload = handleScriptLoad;
        script.onerror = () => {
            setError('Failed to load Google Maps API');
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const handleAddressInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value;
        setInputValue(input);

        if (autocompleteService && input.length > 1) {
            autocompleteService.getPlacePredictions({ input }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setAutocompletePredictions(predictions);
                } else {
                    setAutocompletePredictions([]);
                    if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        setError(`Failed to fetch predictions. Status: ${status}`);
                    }
                }
            });
        } else {
            setAutocompletePredictions([]);
        }
    };

    const handleSelectAddress = (description: string, placeId: string) => {
        setInputValue(description); // Update inputValue for consistent state
        field.onChange(description); // Update form with address
        placeIdField.onChange(placeId); // Update form with placeId

        setAutocompletePredictions([]); // Clear predictions after selection
    };

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <div className="relative">
                    <Input
                        placeholder="Enter address"
                        value={inputValue}
                        onChange={handleAddressInput}
                    />
                    {inputValue.length > 0 && (
                        autocompletePredictions.length > 0 ? (
                            <ul className="absolute z-20 border border-border mt-1 max-h-60 overflow-y-auto w-full bg-popover bg-opacity-90 shadow-lg rounded-md">
                                {autocompletePredictions.map(prediction => (
                                    <li
                                        key={prediction.place_id}
                                        onClick={() => handleSelectAddress(prediction.description, prediction.place_id)}
                                        className="cursor-pointer p-3 hover:bg-muted hover:text-muted-foreground border-b border-border last:border-b-0"
                                    >
                                        {prediction.description}
                                    </li>
                                ))}
                            </ul>
                        ) : !field.value && (
                            <ul className="absolute z-20 border border-border mt-1 max-h-60 overflow-y-auto w-full bg-popover bg-opacity-90 shadow-lg rounded-md">
                                <li className="cursor-pointer p-3 hover:bg-muted hover:text-muted-foreground border-b border-border last:border-b-0">No Suggestions</li>
                            </ul>
                        )
                    )}
                </div>
            </FormControl>
            {error && <p className="text-destructive mt-2">{error}</p>}
            <FormDescription>{description}</FormDescription>
            <FormMessage />
        </FormItem>
    );
}
