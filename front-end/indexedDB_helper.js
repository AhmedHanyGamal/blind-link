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

  // return new Promise((resolve, reject) => {

  // })
}

export {
  openDataBase,
  getObjectStore,
  addIndexedDBEntry,
  getFirstRecord,
  getAllRecords,
  deleteAllRecords,
};
