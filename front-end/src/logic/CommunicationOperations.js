import { encrypt_data } from "./CryptoOperations";

async function send_message(jsObject, encryptionPublicKey) {
  try {
    const encryptedData = await encrypt_data(jsObject, encryptionPublicKey);

    const post_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
    };

    // the backend variable should be changed to the domain or ip:port of the deployed backend
    const backend = import.meta.env.VITE_BACKEND_DOMAIN;
    const response = await fetch(`${backend}/api/post-message`, post_options);

    if (!response.ok) {
      console.error("error while sending to server");
      throw new Error("Network response was NOT ok " + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("failed to send encrypted message:", err);
    return false;
  }
}

export { send_message };
