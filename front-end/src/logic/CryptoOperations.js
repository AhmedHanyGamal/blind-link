import { array_buffer_to_base64 } from "./DataFormatting";
import {
  object_to_array_buffer,
  array_buffer_to_chunks,
  isJSONParsable,
  base64_to_array_buffer,
} from "./DataFormatting";

async function encrypt_data(data, publicKey, chunkSize = 150) {
  const encodedData = object_to_array_buffer(data);
  const chunks = array_buffer_to_chunks(encodedData, chunkSize);

  let encryptedChunks = [];

  try {
    for (let chunk of chunks) {
      const encryptedChunk = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        chunk
      );

      encryptedChunks.push(array_buffer_to_base64(encryptedChunk));
    }
  } catch (error) {
    console.log(
      "There was a problem encrypting the chunks, check if your chunkSize is too big"
    );
    console.log(
      "Since the crypto.subtle.encrypt function only works on small chunks of data"
    );
    console.log("like, a hundred or two hundred bytes or something");
    throw new Error(
      "Chunks Too Big, choose a smaller chunk size. (that's most probably the issue)"
    );
  }

  return encryptedChunks;
}

async function decrypt_message(encrypted_data, privateKey) {
  if (!isJSONParsable(encrypted_data)) {
    return null;
  }

  // console.log("It's JSON parsable");

  const encryptedDataObject = JSON.parse(encrypted_data);

  // console.log("encryptedDataObject:", encryptedDataObject);

  const decryptedChunks = [];
  for (const chunk of encryptedDataObject) {
    const chunkBuffer = base64_to_array_buffer(chunk);
    // console.log("chunkBuffer:", chunkBuffer);

    if (!chunkBuffer) {
      return null;
    }

    // console.log("Valid chunk buffer (at least this time)");

    // const decryptedChunk = await crypto.subtle.decrypt(
    //   { name: "RSA-OAEP" },
    //   privateKey,
    //   chunkBuffer
    // );

    try {
      const decryptedChunk = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        chunkBuffer
      );
      // console.log("decryptedChunk", decryptedChunk);

      decryptedChunks.push(new Uint8Array(decryptedChunk));
    } catch (err) {
      // console.error("IT WAS THE FUCKING DECRYPT FUNCTION AGAIN");
      throw new Error("Problem with decryption");
    }
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
    console.log("decrypted successfully");

    return JSON.parse(jsonString);
  } else {
    return null;
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

  const signatureUint8Array = Array.from(new Uint8Array(signature));
  return signatureUint8Array;
}

async function verify_signature(publicKey, message, signature) {
  const signatureBuffer = new Uint8Array(signature).buffer;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicKey,
    signatureBuffer,
    data.buffer
  );
  return isValid;
}

export { encrypt_data, decrypt_message, sign_message, verify_signature };
