/* ===== Tarif Kutusu - Veri Katmanı (IndexedDB) ===== */
const TK_DB_NAME = 'TarifKutusuDB';
const TK_DB_VERSION = 1;
const TK_STORE = 'tarifler';

const TK_VARSAYILAN_KATEGORILER = [
  'Çorbalar', 'Ana Yemekler', 'Aparatifler', 'Salatalar', 'Tatlılar', 'İçecekler'
];

function tkOpenDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(TK_DB_NAME, TK_DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(TK_STORE)) {
        const store = db.createObjectStore(TK_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('kategori', 'kategori', { unique: false });
        store.createIndex('tarih', 'tarih', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function tkEkle(tarif) {
  return tkOpenDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(TK_STORE, 'readwrite');
    const req = tx.objectStore(TK_STORE).add(tarif);
    req.onsuccess = (e) => resolve(e.target.result);
    tx.onerror = (e) => reject(e.target.error);
  }));
}

function tkGuncelle(tarif) {
  return tkOpenDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(TK_STORE, 'readwrite');
    tx.objectStore(TK_STORE).put(tarif);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  }));
}

function tkSil(id) {
  return tkOpenDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(TK_STORE, 'readwrite');
    tx.objectStore(TK_STORE).delete(Number(id));
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  }));
}

function tkTumu() {
  return tkOpenDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(TK_STORE, 'readonly');
    const req = tx.objectStore(TK_STORE).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => (b.tarih || 0) - (a.tarih || 0)));
    req.onerror = (e) => reject(e.target.error);
  }));
}

function tkGetir(id) {
  return tkOpenDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(TK_STORE, 'readonly');
    const req = tx.objectStore(TK_STORE).get(Number(id));
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  }));
}

function tkResimOku(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function tkKategoriler() {
  const tarifler = await tkTumu();
  const setler = new Set(TK_VARSAYILAN_KATEGORILER);
  tarifler.forEach(t => { if (t.kategori) setler.add(t.kategori); });
  return Array.from(setler);
}
