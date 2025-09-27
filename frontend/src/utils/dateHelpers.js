// src/utils/dateHelpers.js
export const formatIST = (utcDate) => {
  if (!utcDate) return "-";
  const d = new Date(utcDate);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
};

export const utcToLocalInput = (utcDate) => {
  if (!utcDate) return "";
  const d = new Date(utcDate);
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - off);
  return local.toISOString().slice(0, 16);
};
