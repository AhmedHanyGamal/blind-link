import { base64_to_public_key, public_key_to_base64 } from "./key_generator.js";

// let request = indexedDB.open("BlindLink", 1);

function object_to_array_buffer(jsObject) {
  const jsonString = JSON.stringify(jsObject);

  const buffer = new ArrayBuffer(jsonString.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < jsonString.length; i++) {
    bufferView[i] = jsonString.charCodeAt(i);
  }
  return buffer; // could replace this with (bufferView.buffer)
}

async function send_message(jsObject, encryptionPublicKey) {
  //DON'T FORGET TO ENCRYPT YOUR DATA
  // const data = { encrypted_message: message };

  const encodedData = object_to_array_buffer(jsObject);

  const encryptedData = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    encryptionPublicKey,
    encodedData
  );

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
        throw new Error("Network response was NOT ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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

  // convert base64 to actual key --------------------------------------------------
  const friendEncryptionPublicKey = await base64_to_public_key(
    friendEncryptionPublicKeyBase64,
    "encrypt"
  );
  // const friendVerificationPublicKey = base64_to_public_key(friendVerificationPublicKeyBase64, "verify");

  // const message = `this is a friend request\n${introductionMessage}`;

  // save both HIS public keys
  // send both YOUR public keys
  // encrypt using HIS public key
  let myEncryptionPublicKey, myVerificationPublicKey;

  let request = indexedDB.open("BlindLink", 1);
  request.onsuccess = (e) => {
    const newContact = {
      friend_status: "pending",
      contact_name: friendName,
      encryption_public_key: friendEncryptionPublicKeyBase64,
      verification_public_key: friendVerificationPublicKeyBase64,
    };

    //note you should check if you already have him as a friend
    const db = e.target.result;
    const contactsTx = db.transaction("contacts", "readwrite");
    const contactsStore = contactsTx.objectStore("contacts");
    contactsStore.add(newContact);

    const myKeysTx = db.transaction("myKeys", "readonly");
    const myKeysStore = myKeysTx.objectStore("myKeys");
    const cursorRequest = myKeysStore.openCursor();

    cursorRequest.onsuccess = (e) => {
      const cursor = e.target.result;
      myEncryptionPublicKey = cursor.value.encryption_public_key;
      myVerificationPublicKey = cursor.value.verification_public_key;
    };
    cursorRequest.onerror = (e) => {
      console.error("Database Error:", e.target.errorCode);
    };
  };

  const signature = sign_message(myVerificationPublicKey, introductionMessage);

  const data = {
    messageType: "friend request",
    message: introductionMessage,
    signature: signature,
    encryptionPublicKey: myEncryptionPublicKey,
    verificationPublicKey: myVerificationPublicKey,
  };

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

  await send_message(data, friendEncryptionPublicKey);
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

function check_mail() {
  const get_options = {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(encryptedData),
  };

  //              need to change the message_id value, should add a variable in localStorage holding it
  fetch("http://127.0.0.1:8080/api/get-messages?message_id=0", get_options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was NOT ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
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
