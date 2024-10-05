function object_to_array_buffer(jsObject) {
  const jsonString = JSON.stringify(jsObject);
  const encoder = new TextEncoder();

  return encoder.encode(jsonString).buffer;
}

function array_buffer_to_chunks(arrayBuffer, chunkSize) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let chunks = [];

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize).buffer;
    chunks.push(chunk);
  }

  return chunks;
}

function isJSONParsable(objectString) {
  try {
    JSON.parse(objectString);
    return true;
  } catch (error) {
    return false;
  }
}

function is_valid_base64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (error) {
    return false;
  }
}

function base64_to_array_buffer(base64) {
  if (!is_valid_base64(base64)) {
    return null;
  }

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

function array_buffer_to_base64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${date
    .getMonth()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;

  return formattedDate;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  let am_pm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedDate = `${hours}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} ${am_pm}`;

  return formattedDate;
}

function truncateString(str, maxLength, substitute = "...") {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - substitute.length) + substitute;
  }

  return str;
}

export {
  object_to_array_buffer,
  array_buffer_to_chunks,
  isJSONParsable,
  base64_to_array_buffer,
  array_buffer_to_base64,
  formatDate,
  formatTime,
  truncateString,
};
