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
  getAllRecords,
  addIndexedDBEntry,
  deleteAllRecords,
} from "./indexedDB_helper.js";
// let request = indexedDB.open("BlindLink", 1);

function object_to_array_buffer(jsObject) {
  // try {
  const jsonString = JSON.stringify(jsObject);
  // console.log("JSON.stringify object: ", jsonString);

  const encoder = new TextEncoder();

  // console.log(
  //   "encoded JSON.stringify object: ",
  //   encoder.encode(jsonString).buffer
  // );

  return encoder.encode(jsonString).buffer;
  // } catch (error) {
  //   console.error("An error occurred: ", error);
  // }
  // const buffer = new ArrayBuffer(jsonString.length);
  // const bufferView = new Uint8Array(buffer);
  // for (let i = 0; i < jsonString.length; i++) {
  //   bufferView[i] = jsonString.charCodeAt(i);
  // }
  // return buffer; // could replace this with (bufferView.buffer)
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

async function encrypt_data(data, publicKey, chunkSize = 190) {
  // try {
  const encodedData = object_to_array_buffer(data);
  const chunks = array_buffer_to_chunks(encodedData, chunkSize);

  let encryptedChunks = [];
  for (let chunk of chunks) {
    // console.log("chunk size: ", new Uint8Array(chunk).byteLength);
    const encryptedChunk = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      chunk
    );

    // console.log("chunk size: ", new Uint8Array(encryptedChunk).byteLength);
    encryptedChunks.push(array_buffer_to_base64(encryptedChunk));
  }

  // console.log("revamped encrypted chunks: ", encryptedChunks);

  return encryptedChunks;
  // } catch (err) {
  //   console.error("FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUCK");
  //   console.error(err);
  // }
  // const encoder = new TextEncoder();
  // const encodedData = encoder.encode(data);

  // console.log("encoded data: ", encodedData);

  // const decoder = new TextDecoder();
  // const decodedData = decoder.decode(encodedData);
  // console.log("decoded data: ", decodedData);
  // console.log("size in bytes: ", encodedData.byteLength);
  // try {
  //   let encryptedChunks = [];
  //   for (let i = 0; i < encodedData.length; i += chunkSize) {
  //     const chunk = encodedData.slice(i, i + chunkSize);
  //     const encryptedChunk = await crypto.subtle.encrypt(
  //       { name: "RSA-OAEP" },
  //       publicKey,
  //       chunk
  //     );

  //     console.log(
  //       "buffer FUCKING bytessssssssssssssss: ",
  //       encryptedChunk.byteLength
  //     );

  //     encryptedChunks.push(array_buffer_to_base64(encryptedChunk));

  //     // console.log("chunk: ", chunk);
  //     // console.log("chunk as base64: ", array_buffer_to_base64(chunk));
  //     // console.log("encrypted chunk: ", encryptedChunk);
  //     // console.log(
  //     //   "encrypted chunk as base64: ",
  //     //   array_buffer_to_base64(encryptedChunk)
  //     // );
  //   }

  //   console.log("encrypted Chunks", encryptedChunks);
  //   console.log("encrypted Chunks type:", typeof encryptedChunks);
  //   // console.log("encrypted CHUNKS VVV");
  //   // encryptedChunks.forEach((chunk) => console.log(chunk, "\n"));

  //   // return encryptedChunks;
  //   const combinedChunks = encryptedChunks.reduce((acc, cur) => {
  //     return acc.concat(Array.from(cur));
  //   }, []);

  //   return combinedChunks[0];
  // } catch (error) {
  //   console.error("THERE IS A NEW DISCOVERED ERROR");
  // }
}

function isJSONParsable(objectString) {
  try {
    JSON.parse(objectString);
    return true;
  } catch (error) {
    return false;
  }
}

async function decrypt_message(encrypted_data, privateKey) {
  if (!isJSONParsable(encrypted_data)) {
    return null;
  }

  const encryptedDataObject = JSON.parse(encrypted_data);
  const decryptedChunks = [];
  for (const chunk of encryptedDataObject) {
    // try {
    // } catch (error) {
    //   console.error(55555555555555555555555555555555555555555, "A7AAAA");
    // }
    const chunkBuffer = base64_to_array_buffer(chunk);

    if (!chunkBuffer) {
      return null;
    }

    const decryptedChunk = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      chunkBuffer
    );
    decryptedChunks.push(new Uint8Array(decryptedChunk));
  }

  const combinedDecryptedChunks = decryptedChunks.reduce((acc, cur) => {
    const tmp = new Uint8Array(acc.length + cur.length);
    tmp.set(acc, 0);
    tmp.set(cur, acc.length);
    return tmp;
  }, new Uint8Array());

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(combinedDecryptedChunks);

  if (isJSONParsable(jsonString)) {
    return JSON.parse(jsonString);
  } else {
    return null;
  }
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

  // console.log("jsObject size: ", jsObject.byteLength);

  // try {
  // apparently you can't FUCKING encrypt something that is bigger than 245 bytes
  // AAAAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHH

  // console.log(jsObject.signature instanceof ArrayBuffer);

  const encryptedData = await encrypt_data(jsObject, encryptionPublicKey);

  // console.log("array of base64 AAAAAAAAAAAAAAAAAAAAAA: ", encryptedData);

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
  try {
    const post_options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedData),
      // body: encryptedData,
    };

    fetch("http://127.0.0.1:8080/api/post-message", post_options)
      .then((response) => {
        if (!response.ok) {
          console.error("A7A");
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
  } catch (err) {
    console.error("FUCK YOUUUUUUUUUUUUUUUUUUUUU");
  }
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

  // console.log("the type of data is: ", data.buffer instanceof Object);
  // console.log("is signature ArrayBuffer: ", signature instanceof ArrayBuffer);
  // console.log("the type of signature is: ", typeof signature);
  // console.log(signature instanceof Uint8Array);
  // console.log(signature instanceof String);
  // console.log(signature instanceof TextEncoder);
  // console.log(signature instanceof ArrayBuffer);
  // console.log(signature instanceof );
  // console.log(signature instanceof );
  // console.log(signature.constructor.name);

  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicKey,
    signature,
    data.buffer
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
  addIndexedDBEntry(myContactsStore, newContact);

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
  const signatureUint8Array = Array.from(new Uint8Array(signature));

  const data = {
    messageType: "friend request",
    message: introductionMessage,
    signature: signatureUint8Array,
    encryptionPublicKey: myEncryptionPublicKey,
    verificationPublicKey: myVerificationPublicKey,
  };

  // console.log("the A;DLFJ;AKLD JFLK;KJL;AFD data: ", data);

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

// The encrypted data is turned into chunks WRONG here
async function decrypt_chunks(encryptedChunks, privateKey) {
  const decryptedChunks = [];
  for (const chunk of encryptedChunks) {
    // console.log(chunk);
    const encryptedArrayBuffer = base64_to_array_buffer(chunk);
    const decryptedChunk = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedArrayBuffer
    );
    decryptedChunks.push(new Uint8Array(decryptedChunk));
  }

  const combinedDecryptedChunks = decryptedChunks.reduce((acc, cur) => {
    const tmp = new Uint8Array(acc.length + cur.length);
    tmp.set(acc, 0);
    tmp.set(cur, acc.length);
    return tmp;
  }, new Uint8Array());

  const decoder = new TextDecoder();
  const jsonString = decoder.decode(combinedDecryptedChunks);
  return JSON.parse(jsonString);
}

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

async function get_decryption_private_key() {
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

  const myDecryptionPrivateKey = await get_decryption_private_key();
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

  // const verificationPublicKeys = [];

  const newMessages = (await response.json()).data;

  // console.log(newMessages);

  // console.log("The new messages: ", newMessages);
  // try {
  //   console.log("encrypted message type: ", typeof newMessages.message.encrypted_data);
  // } catch (error) {
  //   console.error(error);
  // }

  let myMail = [];

  for (const message of newMessages) {
    const decryptedMessage = await decrypt_message(
      message.encrypted_data,
      myDecryptionPrivateKey
    );
    // const decryptedMessageObject = JSON.parse(decryptedMessage);

    if (decryptedMessage) {
      decryptedMessage.timestamp = message.timestamp;
      decryptedMessage.message_id = message.id;

      myMail.push(decryptedMessage);
    }
  }
  //   try {
  // } catch (error) {
  //   console.error("ERRORRRRRRRRRRRRRRRRRR");
  // }

  // just decrypt the data now
  // newMessages.forEach((message) => {
  //   console.log(typeof message.encrypted_data);
  //   console.log(message.encrypted_data);
  //   console.log(message.encrypted_data.byteLength);
  //   const decryptedMessage = decrypt_chunks(
  //     message.encrypted_data,
  //     myDecryptionPrivateKey
  //   );
  //   if (decryptedMessage.messageType) {
  //     myMail.push(decryptedMessage);
  //   }
  // });

  // console.log(myMail);

  for (const mailItem of myMail) {
    if (mailItem.messageType === "friend request") {
      const {
        message_id,
        message,
        signature,
        encryptionPublicKey,
        verificationPublicKey,
      } = mailItem;

      const verificationPublicKeyCrypto = await base64_to_public_key(
        verificationPublicKey,
        "verify"
      );
      // const messageArrayBuffer = base64_to_array_buffer(message);
      // console.log("signature: ", mailItem.signature);

      const signatureBuffer = new Uint8Array(signature).buffer;

      const isValidSignature = await verify_signature(
        verificationPublicKeyCrypto,
        message,
        signatureBuffer
      );

      console.log("Valid signature: ", isValidSignature);

      if (!isValidSignature) {
        continue;
      }

      // const verification = await crypto.subtle.verify({name:"ECDSA", hash: {name:"SHA-256"}}, encryptionPublicKeyCrypto, signature, )

      const newFriendRequest = {
        message_id: message_id,
        encryption_public_key: encryptionPublicKey,
        verification_public_key: verificationPublicKey,
        intro_message: message,
      };

      const db = await openDataBase("BlindLink", 1);
      const friendRequestStore = getObjectStore(
        db,
        "friendRequests",
        "readwrite"
      );
      addIndexedDBEntry(
        friendRequestStore,
        newFriendRequest,
        newFriendRequest.message_id
      );

      // try {
      // } catch (err) {
      //   console.error("FUUUUUUUUUUUUUUUUUUUUCK!!!!!!!!!!!");
      // }

      console.log("added indexedDB entry");
    } else if (mailItem.messageType === "friend request acceptance") {
    } else if (mailItem.messageType === "communication message") {
    }
  }

  // change this
  await update_friend_requests();
  // uncomment this when you should
  // await update_friends();

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

// All that's left is to actually update the UI

async function update_visible_messages(contactName) {
  const db = await openDataBase("BlindLink", 1);
  const messageStore = getObjectStore(db, "messages", "readonly");
  const messages = await getAllRecords(messageStore, (record) => {
    record.contact_name === contactName;
  });

  const chatBox = document.querySelector(".chatbox");

  //   <li>
  //   <div class="friend-request">
  //     <div class="intro-message">
  //       Hey man, this is {insert_name}, how's it been? accept this
  //       friend request pls
  //     </div>
  //     <button type="button">accept</button>
  //     <button type="button">decline</button>
  //   </div>
  // </li>

  for (const message of messages) {
  }
}

async function update_friend_requests() {
  const db = await openDataBase("BlindLink", 1);
  const friendRequestStore = getObjectStore(db, "friendRequests", "readonly");
  const friendRequests = await getAllRecords(friendRequestStore);

  const friendRequestsModal = document.querySelector(
    ".leftSide .dropdown_content"
  );

  friendRequestsModal.innerHTML = "";

  for (const friendRequest of friendRequests) {
    const intro_message = friendRequest.intro_message;

    const div = document.createElement("div");
    div.style.paddingBottom = div.style.paddingTop = "10px";

    const introText = document.createTextNode(intro_message);
    div.appendChild(introText);

    const accept_button = document.createElement("button", "type='button'");
    accept_button.textContent = "accept";
    accept_button.setAttribute("friend-request-id", friendRequest.message_id);

    const decline_button = document.createElement("button", "type='button'");
    decline_button.textContent = "decline";

    accept_button.addEventListener("click", async (event) => {
      const friendRequestID = event.target.getAttribute("friend-request-id");
      const db = await openDataBase("BlindLink", 1);
      const friendRequestStore = getObjectStore(
        db,
        "friendRequests",
        "readwrite"
      );

      // console.log("friend request ID: ", friendRequestID);

      const friendRequest = (
        await getAllRecords(
          friendRequestStore,
          (record) => record.message_id == friendRequestID
        )
      )[0];

      // console.log("friend request message: ", friendRequest);

      // console.log("friend request message ID: ", friendRequest.message_id);

      const { message_id, encryption_public_key, verification_public_key } =
        friendRequest;

      const temp = {
        temp_id: message_id,
        temp_encryption_public_key: encryption_public_key,
        temp_verification_public_key: verification_public_key,
      };

      const newContact = {
        id: temp.temp_id,
        friend_status: "friend",
        contact_name: "Test Contact Name",
        encryption_public_key: temp.temp_encryption_public_key,
        verification_public_key: temp.temp_verification_public_key,
      };

      // console.log(newContact.encryption_public_key);

      const contactsStore = getObjectStore(db, "contacts", "readwrite");
      addIndexedDBEntry(contactsStore, newContact, newContact.id);

      //await
      deleteAllRecords(
        friendRequestStore,
        (record) => record.id == friendRequestID
      );
    });

    decline_button.addEventListener("click", (event) => {
      const friendRequestLI = event.target.parentElement.parentElement;
      friendRequestLI.remove();
    });

    div.appendChild(document.createElement("br"));

    div.appendChild(accept_button);
    div.appendChild(decline_button);

    const li = document.createElement("li");

    li.appendChild(div);

    friendRequestsModal.appendChild(li);
  }
}

async function update_friends() {
  const db = await openDataBase("BlindLink", 1);
  const contactStore = getObjectStore(db, "contacts", "readonly");
  const contacts = await getAllRecords(contactStore);

  const chatList = document.querySelector(".chatlist");

  //   <div class="block active">
  //   <div class="details">
  //     <div class="listHead">
  //       <h4>Michael Diab Al-Mansori</h4>
  //       <p class="time">10:56</p>
  //     </div>
  //     <div class="message_p">
  //       <p>How are you doing?</p>
  //     </div>
  //   </div>
  // </div>

  for (const contact of contacts) {
    const div = document.createElement("div");
    div.setAttribute("class", "block");

    // to be continued
  }
}

async function update_UI() {
  const db = await openDataBase("BlindLink", 1);
  const friendRequestStore = getObjectStore(db, "friendRequests", "readonly");
  const contactStore = getObjectStore(db, "contacts", "readonly");
  const messageStore = getObjectStore(db, "messages", "readonly");

  const friendRequests = await getAllRecords(friendRequestStore);
  const contacts = await getAllRecords(contactStore);

  const friendRequestsModal = document.querySelector(
    ".leftSide .dropdown_content"
  );
  const contactsList = document.querySelector(".chatlist");
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

export { update_friend_requests };
