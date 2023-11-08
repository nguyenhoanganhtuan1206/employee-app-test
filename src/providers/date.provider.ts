function convertDateFormat(inputDate: string): string {
  const [year, month, day] = inputDate.split('-');

  return `${day}/${month}/${year}`;
}

function formatDateToDDMMYYYY(inputDate: Date): Date {
  if (typeof inputDate === 'string') {
    return convertDateFormat(inputDate) as unknown as Date;
  }

  if (typeof inputDate === 'object') {
    const day = String(inputDate.getUTCDate()).padStart(2, '0');
    const month = String(inputDate.getUTCMonth() + 1).padStart(2, '0');
    const year = inputDate.getUTCFullYear();

    return `${day}/${month}/${year}` as unknown as Date;
  }

  throw new Error('Invalid date string');
}

export class DateProvider {
  static extractCurrentDate(): number {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    return startDate.getTime();
  }

  static extractDateFrom(dateFrom: Date): number {
    const dateFromFormat = new Date(dateFrom);

    return dateFromFormat.getTime();
  }

  static extractDateTo(dateTo: Date): number {
    const dateToFormat = new Date(dateTo);

    return dateToFormat.getTime();
  }

  static extractDateUTC(dateInput: Date): number {
    const dateExtract = new Date(dateInput);
    dateExtract.setUTCHours(0, 0, 0, 0);

    return dateExtract.getTime();
  }

  static formatDate(date: Date): Date {
    return formatDateToDDMMYYYY(date);
  }

  static formatDateUTC(date: Date): Date {
    date.setUTCHours(0, 0, 0, 0);

    return formatDateToDDMMYYYY(date);
  }
}
