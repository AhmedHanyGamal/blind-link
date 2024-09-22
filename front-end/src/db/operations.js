import {
  generate_encryption_key_pair,
  generate_signature_key_pair,
  public_key_to_base64,
} from "../logic/KeyGenerator";

function openDataBase(dbName, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };

    // could add request.onupgradeneeded, not sure if I should or not
  });
}

function getObjectStore(db, storeName, mode) {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function addIndexedDBEntry(
  objectStore,
  data,
  key = "something_that_should_never_be_a_key"
) {
  // const key = data.id;

  const getRequest = objectStore.get(key);

  getRequest.onsuccess = (event) => {
    if (!event.target.result) {
      const addRequest = objectStore.add(data);
      addRequest.onsuccess = () =>
        console.log("successfully added to database");
      addRequest.onerror = (event) => {
        console.error(
          `error adding data to the ${objectStore} store. Error: ${event.target.errorCode}`
        );
      };
    }
  };

  getRequest.onerror = (event) => {
    console.error(
      `error retrieving data from the ${objectStore.name} store. Error: ${event.target.errorCode}`
    );
  };
}

function getFirstRecord(objectStore) {
  return new Promise((resolve, reject) => {
    const request = objectStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        resolve(cursor.value);
      } else {
        resolve(null);
      }
    };

    request.onerror = (event) => {
      reject(event.target.errorCode);
    };
  });
}

function getAllRecords(
  objectStore,
  conditionCallbackFunction = (record) => true
) {
  return new Promise((resolve, reject) => {
    let records = [];

    const request = objectStore.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (conditionCallbackFunction(cursor.value)) {
          records.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(records);
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function deleteAllRecords(
  objectStore,
  conditionCallbackFunction = (record) => true
) {
  const cursorRequest = objectStore.openCursor();

  cursorRequest.onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const record = cursor.value;
      if (conditionCallbackFunction(record)) {
        cursor.delete();
      }
      cursor.continue();
    } else {
      console.log("All records processed.");
    }
  };

  cursorRequest.onerror = (event) => {
    console.error("Error opening cursor: ", event.target.errorCode);
  };
}

async function updateRecordIndex(
  objectStore,
  indexName,
  indexValue,
  updatedData
) {
  const index = objectStore.index(indexName);
  const request = index.getAll(indexValue);

  request.onsuccess = (event) => {
    const records = event.target.result;
    const updatedRecord = { ...records[0], ...updatedData };

    records.forEach((record) => {
      objectStore.delete(record.id);
    });

    const addRequest = objectStore.add(updatedRecord);

    addRequest.onsuccess = () => {
      console.log("Successfully updated record");
    };

    addRequest.onerror = () => {
      console.error("error adding updated record");
    };
  };

  request.onerror = (event) => {
    console.error("error retrieving records: ", request.error);
  };
}

async function updateRecordKey(objectStore, key, updatedData) {
  const getRequest = objectStore.get(key);
  getRequest.onsuccess = (event) => {
    const record = event.target.result;

    if (!record) {
      console.log("no such record exists to update");
      return;
    }

    const updatedRecord = { ...record, ...updatedData };

    const putRequest = objectStore.put(updatedRecord);

    putRequest.onsuccess = (event) => {
      console.log("updated/added contact successfully");
    };

    putRequest.onerror = (event) => {
      console.error("Failed to update/add record");
    };
  };

  getRequest.onerror = (event) => {
    console.error("failed to retrieve record: ", event.target.error);
  };
}

async function getDecryptionPrivateKey() {
  const db = await openDataBase("BlindLink", 1);
  const myKeysStore = getObjectStore(db, "myKeys", "readonly");
  const record = await getFirstRecord(myKeysStore);
  return record ? record.decryption_private_key : null;
}

async function initialize_keys(db) {
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
}

export {
  initialize_keys,
  openDataBase,
  getObjectStore,
  addIndexedDBEntry,
  getFirstRecord,
  getAllRecords,
  deleteAllRecords,
  updateRecordKey,
  updateRecordIndex,
  getDecryptionPrivateKey,
};
