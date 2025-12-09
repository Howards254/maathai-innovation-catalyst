// Generate .ics calendar file for events
export const generateICSFile = (event: {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  endTime?: string;
  meetingUrl?: string;
}) => {
  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = event.endTime 
    ? new Date(`${event.date}T${event.endTime}`)
    : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GreenVerse//Events//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@greenverse.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDateTime)}`,
    `DTEND:${formatDate(endDateTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}${event.meetingUrl ? `\\n\\nJoin: ${event.meetingUrl}` : ''}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadICSFile = (event: any) => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getGoogleCalendarUrl = (event: any) => {
  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = event.endTime 
    ? new Date(`${event.date}T${event.endTime}`)
    : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description + (event.meetingUrl ? `\n\nJoin: ${event.meetingUrl}` : ''),
    location: event.location,
    dates: `${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
