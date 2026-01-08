import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind Merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Parses a date string and fixes timezone issues by forcing it to 12:00 PM local time.
 * Useful for displaying dates without time shifts.
 */
export function getAdjustedDate(dateString: string): Date {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset + (12 * 60 * 60 * 1000));
}

/**
 * Formats a date for the Group Dashboard (Day, Month, Full String)
 */
export function formatDateForGroup(dateString: string) {
    const adjustedDate = getAdjustedDate(dateString);
    return {
        day: adjustedDate.getDate(),
        month: adjustedDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        full: adjustedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    };
}

/**
 * Formats a date for the Main Dashboard (Dayname, HH:mmh)
 */
export function formatDateForMatchList(dateString: string, timeString: string) {
    const adjustedDate = getAdjustedDate(dateString);
    const dayName = adjustedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    return `${capDayName}, ${timeString.slice(0, 5)}h`;
}
