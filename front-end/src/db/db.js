// @ts-nocheck
import {
  generate_encryption_key_pair,
  generate_signature_key_pair,
  public_key_to_base64,
} from "../logic/KeyGenerator";

import {
  openDataBase,
  getObjectStore,
  getFirstRecord,
  addIndexedDBEntry,
} from "./operations";

async function initialize_DB() {
  const request = indexedDB.open("BlindLink", 1);
  request.onupgradeneeded = async function (event) {
    const db = event.target.result;

    // messages objectStore structure:
    // {id (the key), message, messageType (either "sent" or "received"), timestamp (epoch time in milliseconds), verification_public_key (index)}
    if (!db.objectStoreNames.contains("messages")) {
      const objectStore = db.createObjectStore("messages", {
        keyPath: "id",
      });
      objectStore.createIndex(
        "verification_public_key",
        "verification_public_key",
        { unique: false }
      );
    }

    // contacts objectStore structure:
    // {id (the key), contact_name, friend_status (at this point, either pending or friend), encryption_public_key, verification_public_key (index)}
    if (!db.objectStoreNames.contains("contacts")) {
      const objectStore = db.createObjectStore("contacts", {
        keyPath: "id",
        autoIncrement: true,
      });
      objectStore.createIndex(
        "verification_public_key",
        "verification_public_key",
        { unique: false }
      );
    }

    // myKeys objectStore structure:
    // {id, decryption_private_key, encryption_public_key, signature_private_key, verification_public_key}
    if (!db.objectStoreNames.contains("myKeys")) {
      db.createObjectStore("myKeys", { keyPath: "id" });
    }

    // friendRequests objectStore structure:
    // {message_id (the key), friendRequester, intro_message, encryption_public_key, verification_public_key}
    if (!db.objectStoreNames.contains("friendRequests")) {
      db.createObjectStore("friendRequests", {
        keyPath: "message_id",
      });
    }
  };

  request.onsuccess = async function (event) {
    const db = event.target.result;
    const myKeysStore = getObjectStore(db, "myKeys", "readwrite");
    const firstRecord = await getFirstRecord(myKeysStore);

    if (!firstRecord) {
      const encryptionKeyPair = await generate_encryption_key_pair();
      const signatureKeyPair = await generate_signature_key_pair();

      const encryptionPublicKeyBase64 = await public_key_to_base64(
        encryptionKeyPair.publicKey
      );
      const verificationPublicKeyBase64 = await public_key_to_base64(
        signatureKeyPair.publicKey
      );

      const userKeys = {
        id: 1,
        encryption_public_key: encryptionPublicKeyBase64,
        decryption_private_key: encryptionKeyPair.privateKey,
        signature_private_key: signatureKeyPair.privateKey,
        verification_public_key: verificationPublicKeyBase64,
      };

      const myKeysStore2 = getObjectStore(db, "myKeys", "readwrite");
      addIndexedDBEntry(myKeysStore2, userKeys);
      localStorage.setItem("most_recent_message_ID", "0");
      console.log("Welcome new user, happy to have you with us :D");
    } else {
      console.log("Welcome back user :3");
    }
  };

  request.onerror = function (event) {
    console.error("Database error:", event.target.errorCode);
  };
}

export { initialize_DB };
