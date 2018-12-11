export const database = (() => {
  let iDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB;

  let request = null;

  let idb = {};
  let datastore = null;

  let tx = objectStore => {
    let db = datastore;
    return db.transaction(objectStore, "readwrite").objectStore(objectStore);
  };

  idb.open = () =>
    new Promise((resolve, reject) => {
      let version = 1;
      request = iDB.open("sister-p2p", version);

      request.onupgradeneeded = () => {
        let db = request.result;
        db.createObjectStore("data", { keyPath: "uid" });
        db.createObjectStore("temp", { keyPath: "uid" });
      };

      request.onsuccess = () => {
        console.log("Opening database success");
        datastore = request.result;
        resolve(datastore);
      };

      request.onerror = () => {
        console.log("Opening database fail");
        reject();
      };
    });

  idb.addTo = (objectStore, data) => {
    tx(objectStore).put(data);
  };

  idb.getDataFrom = (objectStore, id = null) =>
    new Promise(resolve => {
      let getData = null;
      if (id) {
        getData = tx(objectStore).get(id);
      } else {
        getData = tx(objectStore).getAll();
      }
      getData.onsuccess = ({ target }) => resolve(target.result);
    });

  idb.clearTemp = () => {
    tx(objectStore).clear();
  };

  return idb;
})();
