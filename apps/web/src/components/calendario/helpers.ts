export const getDateInputValue = (date: Date) => {
  const timezoneOffsetMinutes = date.getTimezoneOffset();
  const localTimestamp = date.getTime() - timezoneOffsetMinutes * 60 * 1000;
  const [datePart] = new Date(localTimestamp).toISOString().split('T');
  return datePart ?? '';
};

export const getDatePartFromISO = (isoString: string) => {
  const [datePart] = isoString.split('T');
  return datePart ?? '';
};

export const getTimePartFromISO = (isoString: string, fallback = '00:00') => {
  const [, timePart = ''] = isoString.split('T');
  return timePart.slice(0, 5) || fallback;
};

export const buildISODateTime = (date: string, time: string) =>
  `${date}T${time}:00.000Z`;

export const buildEndOfDayISO = (date: string) =>
  `${date}T23:59:59.999Z`;
