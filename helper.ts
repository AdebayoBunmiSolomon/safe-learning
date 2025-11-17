export const getInitials = (val: string) => {
  if (!val) return "";

  const parts = val.trim().split(/\s+/); // split by spaces
  const first = parts[0][0]; // first char
  const last = parts[parts.length - 1][0]; // last char

  return (first + last).toUpperCase();
};

/**
 * truncates text by default to length of 10 characters or by length of choice.
 * @param text
 * @param length
 * @returns
 */

// export const truncateText = (text: string, length = 10): string => {
//   if (!text) return "...";

//   const limit = Math.max(0, length);
//   return text.length > limit
//     ? `${text.substring(0, limit).trim()} See More...`
//     : text;
// };

export const truncateText = (text: string, length = 10) => {
  if (!text) return { truncated: "...", isTruncated: true };

  const limit = Math.max(0, length);
  const isTruncated = text.length > limit;

  return {
    truncated: isTruncated ? `${text.substring(0, limit).trim()} ` : text,
    isTruncated,
  };
};
