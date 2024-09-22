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

    const algorithm =
      keyUse === "encrypt"
        ? { name: "RSA-OAEP", hash: { name: "SHA-256" } }
        : { name: "ECDSA", namedCurve: "P-256" };
    const keyUsage = keyUse === "encrypt" ? ["encrypt"] : ["verify"];

    const publicKey = await crypto.subtle.importKey(
      "spki",
      binaryKey.buffer,
      algorithm,
      true,
      keyUsage
    );

    return publicKey;
  } catch (error) {
    console.error("failed to import public key", error);
    throw error;
  }
}

/**
 * @param {"encrypt" | "verify"} keyUse
 */
async function is_valid_public_key_base64(base64Key, keyUse) {
  try {
    const binaryString = atob(base64Key);
    const binaryKey = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      binaryKey[i] = binaryString.charCodeAt(i);
    }

    const algorithm =
      keyUse === "encrypt"
        ? { name: "RSA-OAEP", hash: { name: "SHA-256" } }
        : { name: "ECDSA", namedCurve: "P-256" };
    const keyUsage = keyUse === "verify" ? ["verify"] : ["encrypt"];

    const publicKey = await crypto.subtle.importKey(
      "spki",
      binaryKey.buffer,
      algorithm,
      true,
      keyUsage
    );

    return true;
  } catch (error) {
    return false;
  }
}

export {
  generate_encryption_key_pair,
  generate_signature_key_pair,
  public_key_to_base64,
  base64_to_public_key,
  is_valid_public_key_base64,
};
