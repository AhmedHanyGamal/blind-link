import {
  generate_encryption_key_pair,
  generate_signature_key_pair,
  public_key_to_base64,
} from "./key_generator.js";

async function main() {
  let request = indexedDB.open("BlindLink", 1); // don't forget to delete the database from the browser
  request.onupgradeneeded = async function (event) {
    // alert("writing function(event) makes it do the thing ")

    let db = event.target.result;

    if (!db.objectStoreNames.contains("messages")) {
      db.createObjectStore("messages", {
        keyPath: "id",
      });
    }

    if (!db.objectStoreNames.contains("contacts")) {
      db.createObjectStore("contacts", { keyPath: "id", autoIncrement: true });
    }

    if (!db.objectStoreNames.contains("myKeys")) {
      db.createObjectStore("myKeys", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("friendRequests")) {
      db.createObjectStore("friendRequests", {
        keyPath: "id",
        autoIncrement: true,
      }); // autoincrement
    }

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

    //-------------------------------------------

    //------------------------------------------------------------------------------------
  };

  request.onsuccess = async function (event) {
    const db = event.target.result;
    const writeTx = db.transaction("myKeys", "readwrite");
    const myKeysStore1 = writeTx.objectStore("myKeys");
    const writeRequest = myKeysStore1.openCursor(); // could need to await
    writeRequest.onsuccess = async function (e) {
      const cursor = e.target.result;

      if (!cursor) {
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

        // const db = event.target.result; //------------------------------------------
        const tx = db.transaction("myKeys", "readwrite");
        tx.onerror = (e) => {
          alert("ERROR!!!");
        };

        const myKeysStore2 = tx.objectStore("myKeys");
        myKeysStore2.add(userKeys).onsuccess = () => {
          console.log("welcome new user, happy to have you with us");
          displayKeys(db);
        };
      } else {
        console.log("welcome back, user");
        displayKeys(db);
      }
    };
    //------------------------------------------------------------------------------------

    writeRequest.onerror = function (e) {
      console.error("Database error:", e.target.errorCode);
    };

    //------------------------------------------------------------------------------------

    // const encryptionKeyPair = await generate_encryption_key_pair();
    // const signatureKeyPair = await generate_signature_key_pair();

    // const encryptionPublicKeyBase64 = await public_key_to_base64(
    //   encryptionKeyPair.publicKey
    // );
    // const verificationPublicKeyBase64 = await public_key_to_base64(
    //   signatureKeyPair.publicKey
    // );

    // const myKeys = {
    //   id: 1,
    //   encryption_public_key: encryptionPublicKeyBase64,
    //   decryption_private_key: encryptionKeyPair.privateKey,
    //   signature_private_key: signatureKeyPair.privateKey,
    //   verification_public_key: verificationPublicKeyBase64,
    // };

    // const db = event.target.result;
    // const tx = db.transaction("myKeys", "readwrite");
    // const myKeysStore = tx.objectStore("myKeys");
    // myKeysStore.add(myKeys);

    function displayKeys(db) {
      const tx = db.transaction("myKeys", "readonly");
      const myKeysStore3 = tx.objectStore("myKeys");

      const displayRequest = myKeysStore3.openCursor();
      displayRequest.onsuccess = (e) => {
        const cursor = e.target.result;

        const encryptionPublicKeyParagraph = document.querySelector(
          "#display-encryption-public-key"
        );
        const verificationPublicKeyParagraph = document.querySelector(
          "#display-verification-public-key"
        );

        const encryptionPublicKeyText = document.createTextNode(
          cursor.value.encryption_public_key
        );
        encryptionPublicKeyParagraph.appendChild(document.createElement("br"));
        encryptionPublicKeyParagraph.appendChild(encryptionPublicKeyText);

        const verificationPublicKeyText = document.createTextNode(
          cursor.value.verification_public_key
        );
        verificationPublicKeyParagraph.appendChild(
          document.createElement("br")
        );
        verificationPublicKeyParagraph.appendChild(verificationPublicKeyText);
      };
      // encryptionPublicKeyParagraph.textContent += `\n${cursor.value.encryption_public_key}`;
      // verificationPublicKeyParagraph.textContent += `\n${cursor.value.verification_public_key}`;
    }

    console.log("startup successful");
  };

  request.onerror = function (event) {
    console.error("Database error:", event.target.errorCode);
  };
}

main();

// Solve this FUCKING PERSISTENT DATA BULLSHIT
// We can fix the whole persistent data thing with Michael isA
async function persistData() {
  if (navigator.storage) {
    const isPersistent = await navigator.storage.persisted();
    if (!isPersistent) {
      document.querySelector("#persist-data-modal").classList.remove("hide");
      // console.log("bob4");
    }
    // console.log("bob3");
  } else {
    console.error(
      "Couldn't access storage manager interface, data is NOT persistent"
    );
    // console.log("bob2");
  }
  // console.log("bob1");
}

persistData();
// async function test() {
// await persistData();
// }

// test();
