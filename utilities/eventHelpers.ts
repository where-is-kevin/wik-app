import { BusinessEvent } from "@/hooks/useBusinessEvents";

/**
 * Formats business event date range for display
 * Handles both legacy `date` field and new `eventDatetimeStart`/`eventDatetimeEnd` fields
 * @param event - The business event object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatBusinessEventDateRange = (
  event: BusinessEvent,
  options: {
    includeWeekday?: boolean;
    includeYear?: boolean;
    fallback?: string;
  } = {}
): string => {
  const { includeWeekday = false, includeYear = false, fallback = "Date TBD" } = options;

  const startDate = event.eventDatetimeStart || event.date;
  const endDate = event.eventDatetimeEnd;

  if (!startDate) return fallback;

  try {
    const start = new Date(startDate);

    // Check if the date is valid
    if (isNaN(start.getTime())) {
      return fallback;
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    if (includeWeekday) formatOptions.weekday = "short";
    if (includeYear) formatOptions.year = "numeric";

    const startFormatted = start.toLocaleDateString("en-US", formatOptions);

    if (endDate) {
      const end = new Date(endDate);

      // Check if end date is valid
      if (isNaN(end.getTime())) {
        return startFormatted; // Return just start date if end date is invalid
      }

      // If same day, show just one date
      if (start.toDateString() === end.toDateString()) {
        return startFormatted;
      }

      // If different days, show range
      const endFormatted = end.toLocaleDateString("en-US", formatOptions);
      return `${startFormatted} - ${endFormatted}`;
    }

    return startFormatted;
  } catch (error) {
    return fallback;
  }
};

// Format event date range to "Sep 15, 2025 - Sep 19, 2025"
export const formatEventDateRange = (
  startDateTimeString?: string,
  endDateTimeString?: string
): string => {
  if (!startDateTimeString) return "";

  try {
    const startDate = new Date(startDateTimeString);
    const startMonth = startDate.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const startDay = startDate.getUTCDate();
    const startYear = startDate.getUTCFullYear();

    let dateRange = `${startMonth} ${startDay}, ${startYear}`;

    // If end datetime exists and is different from start date, add it to the range
    if (endDateTimeString) {
      const endDate = new Date(endDateTimeString);
      const endMonth = endDate.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const endDay = endDate.getUTCDate();
      const endYear = endDate.getUTCFullYear();

      // Only show end date if it's different from start date
      const startDateOnly = `${startYear}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
      const endDateOnly = `${endYear}-${String(endDate.getUTCMonth() + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

      if (endDateOnly !== startDateOnly) {
        dateRange = `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      }
    }

    return dateRange;
  } catch (error) {
    console.log("Error formatting event date range:", error);
    return "";
  }
};

// Format event time range to "6:00 PM - 9:00 PM"
export const formatEventTimeRange = (
  startDateTimeString?: string,
  endDateTimeString?: string
): string => {
  if (!startDateTimeString) return "";

  try {
    const startDate = new Date(startDateTimeString);
    const startTime = startDate
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
      .toUpperCase();

    let timeRange = startTime;

    // If end datetime exists, add it to the range
    if (endDateTimeString) {
      const endDate = new Date(endDateTimeString);
      const endTime = endDate
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
        .toUpperCase();

      // Only show end time if it's different from start time
      if (endTime !== startTime) {
        timeRange = `${startTime} - ${endTime}`;
      }
    }

    return timeRange;
  } catch (error) {
    console.log("Error formatting event time range:", error);
    return "";
  }
};

// Format event datetime to "Wed, Sept 4th • 6:00 pm - 8:00 pm" or "Wed, Sept 4th • 6:00 pm" (UTC time)
export const formatEventDateTime = (
  startDateTimeString?: string,
  endDateTimeString?: string
): string => {
  if (!startDateTimeString) return "";

  try {
    const startDate = new Date(startDateTimeString);

    // Use UTC methods to avoid local timezone conversion
    const dayName = startDate.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
    const month = startDate.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const day = startDate.getUTCDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
        ? "rd"
        : "th";

    // Format time in UTC
    const startTime = startDate
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
      .toLowerCase();

    let timeRange = startTime;

    // If end datetime exists and is different from start, add it to the range
    if (endDateTimeString) {
      const endDate = new Date(endDateTimeString);
      const endTime = endDate
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
        .toLowerCase();

      // Only show end time if it's different from start time
      if (endTime !== startTime) {
        timeRange = `${startTime} - ${endTime}`;
      }
    }

    return `${dayName}, ${month} ${day}${suffix} • ${timeRange}`;
  } catch (error) {
    console.log("Error formatting event datetime:", error);
    return "";
  }
};

// Helper function to format price
export const formatPrice = (price: number | string | null) => {
  if (price === null || price === undefined) return "Price on request";
  if (typeof price === "string") return price; // Already formatted
  return `€${price}`;
};

// Helper function to extract coordinates from Google Maps URL
export const extractCoordinatesFromUrl = (url: string) => {
  const coordsMatch = url.match(/query=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (coordsMatch && coordsMatch[1] && coordsMatch[2]) {
    return {
      latitude: parseFloat(coordsMatch[1]),
      longitude: parseFloat(coordsMatch[2]),
    };
  }
  // Fallback - return Lisbon coordinates if extraction fails
  return {
    latitude: 38.7223,
    longitude: -9.1393,
  };
};

// Get relative date label (Today, Tomorrow, or actual date)
export const getRelativeDateLabel = (dateString: string): string => {
  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Normalize dates to compare only year, month, day
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (eventDateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (eventDateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow";
    } else {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.log("Error getting relative date label:", error);
    return "Unknown date";
  }
};

// Group events by date for display
export interface GroupedEvent<T> {
  date: string;
  dateLabel: string;
  relativeLabel: string;
  events: T[];
}

export const groupEventsByDate = <T extends { time?: string; date?: string }>(
  events: T[]
): GroupedEvent<T>[] => {
  if (!events || events.length === 0) return [];

  // Group events by date
  const groupedMap = events.reduce((acc, event) => {
    // Try to extract date from date field first (raw ISO), then time field (formatted)
    const dateString = event.date || event.time;
    if (!dateString) return acc;

    let dateKey: string;
    try {
      const eventDate = new Date(dateString);
      // Check if the date is valid
      if (isNaN(eventDate.getTime())) {
        dateKey = "invalid-date";
      } else {
        // Use ISO date string as key (YYYY-MM-DD)
        dateKey = eventDate.toISOString().split('T')[0];
      }
    } catch (error) {
      // If parsing fails, use the original string as key
      dateKey = dateString.split(' ')[0] || dateString;
    }

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, T[]>);

  // Convert to array and sort by date
  const grouped = Object.entries(groupedMap).map(([dateKey, events]) => {
    const firstEvent = events[0];
    const dateString = firstEvent.date || firstEvent.time || '';

    let date: Date;
    try {
      date = new Date(dateString);
      if (isNaN(date.getTime())) {
        date = new Date(); // fallback to today
      }
    } catch (error) {
      date = new Date(); // fallback to today
    }

    const dateLabel = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const relativeLabel = getRelativeDateLabel(dateString);

    return {
      date: dateKey,
      dateLabel,
      relativeLabel,
      events: events,
    };
  });

  // Sort by date
  grouped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return grouped;
};