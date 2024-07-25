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

export { openDataBase, getObjectStore, getFirstRecord };
