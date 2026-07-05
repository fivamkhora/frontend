export function getCurrentDateLabel(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    weekday: "long",
  });

  const formattedDate = formatter.format(date);

  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}
