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

    const response = await fetch(
      "http://127.0.0.1:8080/api/post-message",
      post_options
    );

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
