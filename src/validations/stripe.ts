/**
 * Check if the value is an object.
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Typeguard to check if the object is a valid Stripe webhook event.
 * 
 * @param obj - The object to check.
 * @returns True if the object has the correct shape for a Stripe event.
 */
export function webhookHasMeta(obj: unknown): obj is {
    type: string;
    data: {
        object: Record<string, unknown> & {
            metadata?: Record<string, string>;
        };
    };
} {
    if (
        isObject(obj) &&
        typeof (obj as { type?: string }).type === "string" &&
        isObject((obj as { data?: { object?: Record<string, unknown> } }).data) &&
        isObject((obj as { data?: { object?: Record<string, unknown> } }).data?.object)
    ) {
        return true;
    }
    return false;
}

/**
 * Typeguard to check if the object has a 'data' property and the correct shape.
 * Stripe's events include 'data' with an 'object' property containing the event details.
 *
 * @param obj - The object to check.
 * @returns True if the object has a 'data' property with an 'object'.
 */
export function webhookHasData(obj: unknown): obj is {
    data: {
        object: Record<string, unknown>;
    };
} {
    return (
        isObject(obj) &&
        isObject((obj as { data?: { object?: Record<string, unknown> } }).data) &&
        isObject((obj as { data?: { object?: Record<string, unknown> } }).data?.object)
    );
}
