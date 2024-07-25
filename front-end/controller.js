import {
  base64_to_public_key,
  public_key_to_base64,
  base64_to_array_buffer,
  array_buffer_to_base64,
} from "./key_generator.js";
import {
  openDataBase,
  getObjectStore,
  getFirstRecord,
  addEntry,
} from "./indexedDB_helper.js";
// let request = indexedDB.open("BlindLink", 1);

function object_to_array_buffer(jsObject) {
  try {
    const jsonString = JSON.stringify(jsObject);

    const encoder = new TextEncoder();
    return encoder.encode(jsonString).buffer;
  } catch (error) {
    console.error("An error occurred: ", error);
  }
  // const buffer = new ArrayBuffer(jsonString.length);
  // const bufferView = new Uint8Array(buffer);
  // for (let i = 0; i < jsonString.length; i++) {
  //   bufferView[i] = jsonString.charCodeAt(i);
  // }
  // return buffer; // could replace this with (bufferView.buffer)
}

/**
 * @param {"encrypt" | "verify"} keyUse
 */
async function string_to_public_key(publicKeyString, keyUse) {
  const binaryKey = new TextEncoder().encode(publicKeyString).buffer;

  if (keyUse === "encrypt") {
    return await crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSA-OAEP", hash: { name: "SHA-256" } },
      true,
      ["encrypt"]
    );
  } else if (keyUse === "verify") {
    return await crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["verify"]
    );
  }
}

async function encrypt_data(data, publicKey, chunkSize = 200) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const encryptedChunks = [];
  for (let i = 0; i < encodedData.length; i += chunkSize) {
    const chunk = encodedData.slice(i, i + chunkSize);
    const encryptedChunk = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      chunk
    );

    encryptedChunks.push(new Uint8Array(encryptedChunk));
  }

  const combinedChunks = encryptedChunks.reduce((acc, cur) => {
    return acc.concat(Array.from(cur));
  }, []);

  return combinedChunks;
}

async function send_message(jsObject, encryptionPublicKey) {
  //DON'T FORGET TO ENCRYPT YOUR DATA
  // const data = { encrypted_message: message };
  // try {
  // console.log("log 1");
  // encodedData need to be split into chunks before encryption
  // const encodedData = object_to_array_buffer(jsObject); // potential problem 1
  // const encoder = new TextEncoder();
  // const encodedData = encoder.encode("I FUCKING HATE YOU").buffer;

  // console.log("log 2", encodedData.constructor.name);
  // if (encryptionPublicKey instanceof CryptoKey) {
  //   console.log("something else is wrong");
  // } else {
  //   console.log("FOUND IT, IT'S THE PUBLIC KEY MATHAFACKA");
  // }

  // console.log("Encryption Public Key:", encryptionPublicKey);
  // console.log("Is CryptoKey:", encryptionPublicKey instanceof CryptoKey);
  // console.log("Encoded Data:", encodedData);
  // console.log("Is ArrayBuffer:", encodedData instanceof ArrayBuffer);

  // console.log(encodedData.byteLength);

  // try {
  // apparently you can't FUCKING encrypt something that is bigger than 245 bytes
  // AAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHH

  const encryptedData = await encrypt_data(jsObject, encryptionPublicKey);

  // const encryptedData = await crypto.subtle.encrypt(
  //   { name: "RSA-OAEP" },
  //   encryptionPublicKey,
  //   encodedData
  // );
  // } catch (error) {
  //   console.error("an error occurred: ", error);
  // }

  // const encryptedData = await crypto.subtle.encrypt(
  //   { name: "RSA-OAEP" },
  //   encryptionPublicKey,
  //   encodedData
  // );

  // } catch (error) {
  //   console.error("encryption error", error);
  //   throw error;
  // }
  // try {
  // console.log("log 3");

  // const encryptedDataBase64 = array_buffer_to_base64(encryptedData);

  // console.log("encrypted data: ", encryptedDataBase64);

  const post_options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(encryptedDataBase64),
    body: JSON.stringify(encryptedData),
  };

  fetch("http://127.0.0.1:8080/api/post-message", post_options)
    .then((response) => {
      if (!response.ok) {
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
  // } catch (error) {
  //   console.error("an error occurred: ", error);
  // }
}

async function sign_message(privateKey, message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    data
  );
  return signature;
}

async function verify_signature(publicKey, message, signature) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicKey,
    signature,
    data
  );
  return isValid;
}

async function send_friend_request() {
  // console.log("very beginning");

  const friendEncryptionPublicKeyBase64 = document
    .querySelector("#friend-encryption-public-key")
    .value.trim();
  const friendVerificationPublicKeyBase64 = document
    .querySelector("#friend-verification-public-key")
    .value.trim();

  const introductionMessage = document
    .querySelector("#introduction-message")
    .value.trim();

  const friendName = document.querySelector("#friend-name").value.trim();

  // console.log("trimmed and stuff");
  // console.log('"' + friendEncryptionPublicKeyBase64 + '"');

  if (
    !(
      friendEncryptionPublicKeyBase64 &&
      friendVerificationPublicKeyBase64 &&
      introductionMessage &&
      friendName
    )
  ) {
    alert("all friend request data must be added");
    return;
  }

  // console.log("everything was entered");

  // convert base64 to actual key --------------------------------------------------
  const friendEncryptionPublicKey = await base64_to_public_key(
    friendEncryptionPublicKeyBase64,
    "encrypt"
  );
  // console.log("just imported the public key");
  // console.log("Encryption Public Key:", friendEncryptionPublicKey);
  // console.log("Is CryptoKey:", friendEncryptionPublicKey instanceof CryptoKey);

  // console.log("converted string to public key");

  // const friendVerificationPublicKey = base64_to_public_key(friendVerificationPublicKeyBase64, "verify");

  // const message = `this is a friend request\n${introductionMessage}`;

  // save both HIS public keys
  // send both YOUR public keys
  // encrypt using HIS public key

  const newContact = {
    friend_status: "pending",
    contact_name: friendName,
    encryption_public_key: friendEncryptionPublicKeyBase64,
    verification_public_key: friendVerificationPublicKeyBase64,
  };

  const db = await openDataBase("BlindLink", 1);
  const myContactsStore = getObjectStore(db, "contacts", "readwrite");
  addEntry(myContactsStore, newContact);

  const myKeysStore = getObjectStore(db, "myKeys", "readonly");
  const record = await getFirstRecord(myKeysStore);
  const myEncryptionPublicKey = record.encryption_public_key;
  const myVerificationPublicKey = record.verification_public_key;
  const mySignaturePrivatekey = record.signature_private_key;

  // console.log("got everything from the IndexedDB database");

  // let request = indexedDB.open("BlindLink", 1);
  // request.onsuccess = (e) => {
  //   const newContact = {
  //     friend_status: "pending",
  //     contact_name: friendName,
  //     encryption_public_key: friendEncryptionPublicKeyBase64,
  //     verification_public_key: friendVerificationPublicKeyBase64,
  //   };

  //   //note you should check if you already have him as a friend
  //   const db = e.target.result;
  //   const contactsTx = db.transaction("contacts", "readwrite");
  //   const contactsStore = contactsTx.objectStore("contacts");
  //   contactsStore.add(newContact);

  //   const myKeysTx = db.transaction("myKeys", "readonly");
  //   const myKeysStore = myKeysTx.objectStore("myKeys");
  //   const cursorRequest = myKeysStore.openCursor();

  //   cursorRequest.onsuccess = (e) => {
  //     const cursor = e.target.result;
  //     myEncryptionPublicKey = cursor.value.encryption_public_key;
  //     myVerificationPublicKey = cursor.value.verification_public_key;
  //     mySignaturePrivatekey = cursor.value.signature_private_key;
  //   };
  //   cursorRequest.onerror = (e) => {
  //     console.error("Database Error:", e.target.errorCode);
  //   };
  // };
  // const thePrivateKey = crypto.subtle.importKey("pkcs8", mySignaturePrivatekey, )

  const signature = await sign_message(
    mySignaturePrivatekey,
    introductionMessage
  );

  // console.log("signed the message");

  const data = {
    messageType: "friend request",
    message: introductionMessage,
    signature: signature,
    encryptionPublicKey: myEncryptionPublicKey,
    verificationPublicKey: myVerificationPublicKey,
  };

  // console.log("made the data");

  // const data = {
  //   type: "friend request",
  //   encryption_public_key: ,// the public key used for sending messages to me
  //   signature_validation_public_key: , // the public key used for authenticating my signatures
  //   message: introductionMessage,
  // };

  // const encoded_data = new TextEncoder().encode(data);

  // const encrypted_message = window.crypto.subtle.encrypt(
  //   { name: "RSA-OAEP" },
  //   friendPublicKey,
  //   encoded_data
  // );

  // console.log("about to enter send_message");

  send_message(data, friendEncryptionPublicKey);
  //   send_message(document.querySelector("#introduction-message").value);
  document.querySelector("#add-friend-modal").classList.toggle("hide");

  document.querySelectorAll("#add-friend-modal textarea").forEach((element) => {
    element.value = "";
  });
  document.querySelector("#friend-name").value = "";
}
// Function to auto-resize the textarea
// function autoResizeTextarea(textarea, maxRows = 6) {
//   textarea.style.height = "60px"; // Reset height to auto to calculate scrollHeight
//   const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
//   const maxHeight = lineHeight * maxRows;

//   if (textarea.scrollHeight > maxHeight) {
//     textarea.style.height = maxHeight + "px";
//     textarea.style.overflowY = "auto"; // Add vertical scrollbar if exceeds max height
//   } else {
//     textarea.style.height = textarea.scrollHeight + "px"; // Set the height to the scrollHeight
//     textarea.style.overflowY = "hidden"; // Hide vertical scrollbar
//   }
// }

async function decrypt_data(encryptedData, privateKey) {
  const encryptedArrayBuffer = base64_to_array_buffer(encryptedData);

  const decryptedArrayBuffer = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedArrayBuffer
  );
  const jsonString = new TextDecoder().decode(decryptedArrayBuffer);
  return JSON.parse(jsonString);
}

async function getDecryptionPrivateKey() {
  const db = await openDataBase("BlindLink", 1);
  const myKeysStore = getObjectStore(db, "myKeys", "readonly");
  const record = await getFirstRecord(myKeysStore);
  return record ? record.decryption_private_key : null;
}

async function check_mail() {
  const get_options = {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(encryptedData),
  };

  //              need to change the message_id value, should add a variable in localStorage holding it
  const response = await fetch(
    "http://127.0.0.1:8080/api/get-messages?message_id=0",
    get_options
  );
  if (!response.ok) {
    alert(
      "Something went wrong when fetching from the server\n" +
        response.statusText
    );
    return;
  }

  const myDecryptionPrivateKey = await getDecryptionPrivateKey();
  // const dbRequest = indexedDB.open("BlindLink", 1);
  // dbRequest.onsuccess = (e) => {
  //   const db = e.target.result;
  //   const tx = db.transaction("myKeys", "readonly");
  //   const store = tx.objectStore("myKeys");
  //   const cursorRequest = store.openCursor();

  //   cursorRequest.onsuccess = (e) => {
  //     const cursor = e.target.result;
  //     myDecryptionPrivateKey = cursor.value.decryption_private_key;
  //   };

  //   cursorRequest.onerror = (e) => {
  //     console.error("Database Cursor Error:", e.target.errorCode);
  //   };
  // };

  // dbRequest.onerror = (e) => {
  //   console.error("Database Error:", e.target.errorCode);
  // };

  const verificationPublicKeys = [];

  const newMessages = (await response.json()).data;

  let myMail = [];
  newMessages.forEach((message) => {
    // console.log(typeof message.encrypted_data);
    const decryptedMessage = decrypt_data(
      message.encrypted_data,
      myDecryptionPrivateKey
    );
    if (decryptedMessage.messageType) {
      myMail.push(decryptedMessage);
    }
  });

  console.log(myMail);

  // .then((response) => {
  //   if (!response.ok) {
  //     throw new Error("Network response was NOT ok " + response.statusText);
  //   }
  //   return response.json();
  // })
  // .then((data) => {
  //   console.log("Success:", data);
  // })
  // .catch((error) => {
  //   console.error("Error:", error);
  // });
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector(".chat_input textarea")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const textareaElement = event.target;

        if (event.shiftKey) {
          event.preventDefault();
          const start = textareaElement.selectionStart;
          const end = textareaElement.selectionEnd;
          textareaElement.value =
            textareaElement.value.substring(0, start) +
            "\n" +
            textareaElement.value.substring(end);
          textareaElement.selectionStart = textareaElement.selectionEnd =
            start + 1;
        } else {
          const message = textareaElement.value;
          event.preventDefault();
          send_message(message);
          textareaElement.value = "";
        }
      }
    });

  document
    .querySelector("#add-friend-form button")
    .addEventListener("click", send_friend_request);

  document
    .querySelector("#add-friend-form textarea")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        send_friend_request();
      }
    });

  document
    .querySelector("#add-friend-form input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        send_friend_request();
      }
    });

  document.querySelector("#check-mail").addEventListener("click", check_mail);
});

// Event listener for input events to auto-resize the textarea
// document
//   .querySelector(".chat_input textarea")
//   .addEventListener("input", function () {
//     autoResizeTextarea(this);
//   });

// Initialize the auto-resize on page load
// window.addEventListener("load", function () {
//   autoResizeTextarea(document.querySelector(".chat_input textarea"));
// });

// const test_data = { encrypted_message: "SEND MORE DUDES!!!!!" };

// const post_options = {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify(test_data),
// };

// fetch("http://127.0.0.1:8080/api/post-message", post_options)
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error("Network response was NOT ok " + response.statusText);
//     }
//     return response.json();
//   })
//   .then((data) => {
//     console.log("Success:", data);
//   })
//   .catch((error) => {
//     console.error("Error:", error);
//   });
