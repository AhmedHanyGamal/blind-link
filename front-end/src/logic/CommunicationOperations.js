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

    fetch("http://127.0.0.1:8080/api/post-message", post_options)
      .then((response) => {
        if (!response.ok) {
          console.error("error while sending to server");
          throw new Error("Network response was NOT ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Successfully sent encrypted message:", data);
      })
      .catch((error) => {
        console.error("Failed to send encrypted message:", error);
      });

    return true;
  } catch (err) {
    console.error("couldn't send the message");
    return false;
  }
}

export { send_message };
