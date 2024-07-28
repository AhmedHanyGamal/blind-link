async function generate_encryption_key_pair() {
  const extractableKeyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedPrivateKey = await crypto.subtle.exportKey(
    "pkcs8",
    extractableKeyPair.privateKey
  );

  const nonExtractablePrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    exportedPrivateKey,
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    false,
    ["decrypt"]
  );

  const keyPair = {
    publicKey: extractableKeyPair.publicKey,
    privateKey: nonExtractablePrivateKey,
  };

  return keyPair;
}

async function generate_signature_key_pair() {
  const extractableKeyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );

  const exportedPrivateKey = await crypto.subtle.exportKey(
    "pkcs8",
    extractableKeyPair.privateKey
  );

  const nonExtractablePrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    exportedPrivateKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const keyPair = {
    publicKey: extractableKeyPair.publicKey,
    privateKey: nonExtractablePrivateKey,
  };

  return keyPair;
}

async function public_key_to_base64(key) {
  const exportedKey = await crypto.subtle.exportKey("spki", key);
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  return base64Key;
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
  // return atob(binary);
}

// /**
//  * @param {"encrypt" | "verify"} keyUse
//  */
// async function base64_to_public_key(base64Key, keyUse) {
//   try {
//     const binaryKey = base64_to_array_buffer(base64Key);

//     if (keyUse === "encrypt") {
//       return crypto.subtle.importKey(
//         "spki",
//         binaryKey,
//         { name: "RSA-OAEP", hash: { name: "SHA-256" } },
//         true,
//         ["encrypt"]
//       );
//     } else if (keyUse === "verify") {
//       return crypto.subtle.importKey(
//         "spki",
//         binaryKey,
//         { name: "ECDSA", namedCurve: "P-256" },
//         true,
//         ["verify"]
//       );
//     }
//   } catch (error) {
//     console.error("failed to import public key", error);
//     throw error;
//   }
// }

/**
 * @param {"encrypt" | "verify"} keyUse
 */
async function base64_to_public_key(base64Key, keyUse) {
  try {
    const binaryString = atob(base64Key);
    const binaryKey = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      binaryKey[i] = binaryString.charCodeAt(i);
    }

    const algorithm = { name: "RSA-OAEP", hash: { name: "SHA-256" } };
    const keyUsage = keyUse === "encrypt" ? ["encrypt"] : ["verify"];

    const publicKey = await crypto.subtle.importKey(
      "spki",
      binaryKey.buffer,
      algorithm,
      true,
      keyUsage
    );

    // console.log("Public key imported successfully: ", publicKey);
    // console.log("Encryption Public Key:", publicKey);
    // console.log("Is CryptoKey:", publicKey instanceof CryptoKey);

    return publicKey;
  } catch (error) {
    console.error("failed to import public key", error);
    throw error;
  }
}

export {
  generate_encryption_key_pair,
  generate_signature_key_pair,
  public_key_to_base64,
  base64_to_public_key,
  base64_to_array_buffer,
  array_buffer_to_base64,
};

// async function store_key_pairs(encryption_key_pair, signature_key_pair) {
//   const exportedEncryptionPublicKey = await crypto.subtle.exportKey(
//     "spki",
//     encryption_key_pair.publicKey
//   );
//   const encryptionPublicKeyBase64 = btoa(
//     String.fromCharCode(...new Uint8Array(exportedEncryptionPublicKey))
//   );

//   const exportedVerificationPublicKey = await crypto.subtle.exportKey(
//     "spki",
//     signature_key_pair.publicKey
//   );
//   const verificationPublicKeyBase64 = btoa(
//     String.fromCharCode(...new Uint8Array(exportedVerificationPublicKey))
//   );

//   const dbrequest = indexedDB.open("BlindLink", 2); //check the version correctness

//   dbrequest.onupgradeneeded = function (event) {
//     const db = event.target.result;

//     let myKeys = db.createObjectStore("myKeys", { keyPath: "id" });
//     myKeys.createIndex("encryption_public_key", "encryption_public_key");
//     myKeys.createIndex("decryption_private_key", "decryption_private_key");
//     myKeys.createIndex("signature_private_key", "signature_private_key");
//     myKeys.createIndex("verification_public_key", "verification_public_key");

//     // db.createObjectStore("myKeys", { keyPath: "id" });
//   };

//   dbrequest.onsuccess = function (event) {
//     const db = event.target.result;
//     const transaction = db.transaction("myKeys", "readwrite");
//     const store = transaction.objectStore("myKeys");
//     // store.put({ id: "id", key: 1 });
//     store.put({ id: "encryption_public_key", key: encryptionPublicKeyBase64 });
//     store.put({
//       id: "decryption_private_key",
//       key: encryption_key_pair.privateKey,
//     });
//     store.put({
//       id: "signature_private_key",
//       key: signature_key_pair.privateKey,
//     });
//     store.put({
//       id: "verification_public_key",
//       key: verificationPublicKeyBase64,
//     });
//     localStorage.setItem("areKeysGenerated", "true");
//   };

//   dbrequest.onerror = function (event) {
//     console.error(event.target.errorCode);
//   };
// }

// async function retrieve_key_pairs() {
//   const openDB = (name, version) => {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(name, version);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   };

//   const getObjectStore = (db, storeName, mode) => {
//     const transaction = db.transaction(storeName, mode);
//     return transaction.objectStore(storeName);
//   };

//   const getItem = (store, key) => {
//     return new Promise((resolve, reject) => {
//       const request = store.get(key);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   };

//   try {
//     const db = await openDB("BlindLink", 2); // check version number
//     const store = await getObjectStore(db, "myKeys", "readonly");
//     const encryptionPublicKey = await getItem(store, "encryption_public_key");
//     const decryptionPrivateKey = await getItem(store, "decryption_private_key");
//     const signaturePrivateKey = await getItem(store, "signature_private_key");
//     const verificationPublicKey = await getItem(
//       store,
//       "verification_public_key"
//     );

//     encryptionKeyPair = {
//       publicKey: encryptionPublicKey,
//       privateKey: decryptionPrivateKey,
//     };
//     signatureKeyPair = {
//       publicKey: verificationPublicKey,
//       privateKey: signaturePrivateKey,
//     };

//     return { encryptionKeyPair, signatureKeyPair };
//   } catch (error) {
//     throw new Error(`Failed to retrieve key pair: ${error}`);
//   }
// }

// async function initialize_client() {
//   if (!localStorage.getItem("areKeysGenerated")) {
//     const encryptionKeyPair = await generate_encryption_key_pair();
//     const signatureKeyPair = await generate_signature_key_pair();

//     await store_key_pairs(encryptionKeyPair, signatureKeyPair);
//   } else {
//     const { encryptionKeyPair, signatureKeyPair } = await retrieve_key_pairs();
//     console.log("successfully retrieved keys from storage");
//   }
// }

// initialize_client().catch(console.error);

// generate_encryption_key_pair()
//   .then((nonExtractableEncryptionKeyPair) => {
//     console.log(
//       "public key extractability: ",
//       nonExtractableEncryptionKeyPair.publicKey.extractable
//     );
//     console.log(
//       "private key extractability: ",
//       nonExtractableEncryptionKeyPair.privateKey.extractable
//     );
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// generate_signature_key_pair().then((signature_key_pair) => {
//   console.log(
//     "public key extractability: ",
//     signature_key_pair.publicKey.extractable
//   );
//   console.log(
//     "private key extractability: ",
//     signature_key_pair.privateKey.extractable
//   );
// });
