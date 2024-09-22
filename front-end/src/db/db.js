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

// let db;

// async function main() {
async function initialize_DB() {
  // if (db) {
  //   db.close();
  //   console.log("Closed existing DB connection before initializing a new one");
  // }

  const request = indexedDB.open("BlindLink", 1);
  request.onupgradeneeded = async function (event) {
    // console.log("in log owo");

    const db = event.target.result;

    if (!db.objectStoreNames.contains("messages")) {
      db.createObjectStore("messages", {
        keyPath: "id",
      });
    }

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

    if (!db.objectStoreNames.contains("myKeys")) {
      db.createObjectStore("myKeys", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("friendRequests")) {
      db.createObjectStore("friendRequests", {
        keyPath: "message_id",
      });
    }

    // console.log("working as expected UWU");

    // let db = openDataBase("BlindLink", 1);
    // await initialize_keys(db);
    // const openRequest = indexedDB.open("BlindLink", 1);

    // openRequest.onerror = (event) => {
    //   console.error(
    //     "couldn't open the newly initialized database to enter data. error code:",
    //     event.target.errorCode
    //   );
    // };

    // openRequest.onsuccess = async function (event) {
    //   const inputDB = event.target.result;

    //   const tx = db.transaction("myKeys", "readwrite");
    //   const myKeysStore = tx.objectStore("myKeys");

    //   const encryptionKeyPair = await generate_encryption_key_pair();
    //   const signatureKeyPair = await generate_signature_key_pair();

    //   const encryptionPublicKeyBase64 = await public_key_to_base64(
    //     encryptionKeyPair.publicKey
    //   );
    //   const verificationPublicKeyBase64 = await public_key_to_base64(
    //     signatureKeyPair.publicKey
    //   );

    //   const keys = {
    //     id: 1,
    //     encryption_public_key: encryptionPublicKeyBase64,
    //     decryption_private_key: encryptionKeyPair.privateKey,
    //     signature_private_key: signatureKeyPair.privateKey,
    //     verification_public_key: verificationPublicKeyBase64,
    //   };

    //   const addRequest = myKeysStore.add(keys);

    //   addRequest.onsuccess = () => {
    //     console.log("indexedDB fully initialized successfully");
    //   };

    //   addRequest.onerror = (event) => {
    //     console.error(
    //       "error adding your keys to the database. error:",
    //       event.target.errorCode
    //     );
    //   };
    // };

    // encryption_public_key
    // verification_public_key
    // intro_message

    // messages.createIndex("message", "message", { unique: false });
    // messages.createIndex("timestamp", "timestamp", { unique: false });
    // messages.createIndex("contact_name", "contact_name", { unique: false }); //{unique: false} could do this

    // contacts.createIndex("friend_status", "friend_status", {unique: false}); // either "pending" if the friend request wasn't accepted or "friend" if it was accepted
    // contacts.createIndex("contact_name", "contact_name", { unique: false });
    // contacts.createIndex("encryption_public_key", "encryption_public_key", {
    //   unique: true,
    // });
    // contacts.createIndex("verification_public_key", "verification_public_key", {
    //   unique: true,
    // });

    // myKeys.createIndex("encryption_public_key", "encryption_public_key");
    // myKeys.createIndex("decryption_private_key", "decryption_private_key");
    // myKeys.createIndex("signature_private_key", "signature_private_key");
    // myKeys.createIndex("verification_public_key", "verification_public_key");
  };

  request.onsuccess = async function (event) {
    const db = event.target.result;

    // console.log("DB:", db);

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
      console.log("Welcome new user, happy to have you with us :D");
    } else {
      console.log("Welcome back user :3");
    }
  };

  request.onerror = function (event) {
    console.error("Database error:", event.target.errorCode);
  };
  // }
}

// async function initialize_keys(db) {
//   const myKeysStore = getObjectStore(db, "myKeys", "readwrite");

//   const firstRecord = await getFirstRecord(myKeysStore);

//   if (!firstRecord) {
//     const encryptionKeyPair = await generate_encryption_key_pair();
//     const signatureKeyPair = await generate_signature_key_pair();

//     const encryptionPublicKeyBase64 = await public_key_to_base64(
//       encryptionKeyPair.publicKey
//     );
//     const verificationPublicKeyBase64 = await public_key_to_base64(
//       signatureKeyPair.publicKey
//     );

//     const userKeys = {
//       id: 1,
//       encryption_public_key: encryptionPublicKeyBase64,
//       decryption_private_key: encryptionKeyPair.privateKey,
//       signature_private_key: signatureKeyPair.privateKey,
//       verification_public_key: verificationPublicKeyBase64,
//     };

//     const myKeysStore2 = getObjectStore(db, "myKeys", "readwrite");
//     addIndexedDBEntry(myKeysStore2, userKeys);
//     console.log("Welcome new user, happy to have you with us :D");
//   } else {
//     console.log("Welcome back user :3");
//   }
// }
export { initialize_DB };
// export { main };

// main();
