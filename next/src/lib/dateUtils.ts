export const normalizeToBangkokMidnight = (date: Date | string): Date => {
  if (!date) {
    throw new Error("Date is required");
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date provided: ${date}`);
  }

  // Create new date at midnight in local timezone (Bangkok for Thai users)
  const normalized = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    0,
    0,
    0,
    0
  );

  // Check if the normalized date is valid
  if (isNaN(normalized.getTime())) {
    throw new Error(`Failed to normalize date: ${date}`);
  }

  return normalized;
};

/**
 * Converts a date input string (YYYY-MM-DD or ISO string) to normalized Bangkok date
 */
export const parseDateInputToBangkok = (dateString: string): Date => {
  // Validate input
  if (typeof dateString !== "string" || !dateString) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  // Handle ISO string format (from serialized Date objects)
  if (dateString.includes("T") || dateString.includes("Z")) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date string: ${dateString}`);
    }
    // Normalize to Bangkok midnight
    return normalizeToBangkokMidnight(date);
  }

  // Handle YYYY-MM-DD format
  const parts = dateString.split("-");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid date format: ${dateString}. Expected YYYY-MM-DD or ISO string`
    );
  }

  const [year, month, day] = parts.map(Number);

  // Validate date components
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components: ${dateString}`);
  }

  // Create date and normalize to Bangkok timezone
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);

  // Check if the created date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Created invalid date from: ${dateString}`);
  }

  return normalizeToBangkokMidnight(date);
};

/**
 * Formats a date for HTML date input (YYYY-MM-DD)
 * Uses local date components to avoid timezone shifts
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Compares two dates by their date components only (ignoring time)
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDateOnly = (date1: Date, date2: Date): number => {
  const norm1 = normalizeToBangkokMidnight(date1);
  const norm2 = normalizeToBangkokMidnight(date2);

  if (norm1.getTime() < norm2.getTime()) return -1;
  if (norm1.getTime() > norm2.getTime()) return 1;
  return 0;
};

/**
 * Checks if two dates are the same day (ignoring time)
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return compareDateOnly(date1, date2) === 0;
};

/**
 * Checks if date1 is before date2 (date comparison only)
 */
export const isDateBefore = (date1: Date, date2: Date): boolean => {
  return compareDateOnly(date1, date2) < 0;
};

/**
 * Checks if date1 is after date2 (date comparison only)
 */
export const isDateAfter = (date1: Date, date2: Date): boolean => {
  return compareDateOnly(date1, date2) > 0;
};

/**
 * Formats a date for HTML datetime-local input (YYYY-MM-DDTHH:mm)
 * Preserves the exact datetime without timezone conversion
 */
export const formatDateTimeForInput = (
  date: Date | null | undefined
): string => {
  if (!date) return "";

  // Format as YYYY-MM-DDTHH:mm for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Converts a datetime-local input string (YYYY-MM-DDTHH:mm) to Date object
 * Assumes the input is already in the desired timezone (Bangkok)
 */
export const parseDateTimeInputToBangkok = (dateTimeString: string): Date => {
  if (!dateTimeString) throw new Error("DateTime string is required");

  // Parse the datetime-local input (YYYY-MM-DDTHH:mm)
  const date = new Date(dateTimeString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime provided: ${dateTimeString}`);
  }

  return date;
};
