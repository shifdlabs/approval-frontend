import { format, parse } from 'date-fns';

export const basicDateConverter = (dateString: string) => {
    const date = new Date(dateString);  // Parse the ISO 8601 date string
  
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed, add 1
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
  
    // Return the formatted date as MM/DD/YYYY
    return `${month}/${day}/${year}`;
}

export function formatToWeekdayTime(input: string): string {
    // Parse:  yyyy-MM-dd HH:mm:ss.SSSSSS  xx   'WIB'
    //           ───────── fractional ─────  ──  literal
    const parsedDate = parse(
      input,
      "yyyy-MM-dd HH:mm:ss.SSSSSS xx 'WIB'",
      new Date()
    );
  
    // Format: full weekday, hour:minute, 12-hour clock with AM/PM
    return format(parsedDate, 'EEEE h:mm a');
  }

        function formatDate(input: string): string {
          const date = new Date(input);
        
          // Get each date component and pad with zero if needed
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear();
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");
        
          // Construct the formatted date string
          return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
        }
