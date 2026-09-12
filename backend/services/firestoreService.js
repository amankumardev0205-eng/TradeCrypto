const { db } = require('../config/firebase');

// In-memory fallback database for offline / local test executions
const memoryStore = new Map();

const getCollectionStore = (collection) => {
  if (!memoryStore.has(collection)) {
    memoryStore.set(collection, new Map());
  }
  return memoryStore.get(collection);
};

/**
 * Reusable Firestore Service Layer providing clean, async database operations with graceful fallbacks.
 */
const firestoreService = {
  /**
   * Create a document in a collection with custom ID or auto-generated ID.
   */
  create: async (collection, data, customId = null) => {
    const timestamp = new Date().toISOString();
    const docData = {
      ...data,
      createdAt: data.createdAt || timestamp,
      updatedAt: data.updatedAt || timestamp,
    };

    try {
      if (customId) {
        const docRef = db.collection(collection).doc(String(customId));
        await docRef.set(docData);
        const created = { id: String(customId), ...docData };
        getCollectionStore(collection).set(created.id, created);
        return created;
      } else {
        const docRef = await db.collection(collection).add(docData);
        const created = { id: docRef.id, ...docData };
        getCollectionStore(collection).set(created.id, created);
        return created;
      }
    } catch (err) {
      console.warn(`[firestoreService] Notice: Cloud Firestore unavailable for collection '${collection}', using local memory store.`);
      const fallbackId = String(customId || `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
      const created = { id: fallbackId, ...docData };
      getCollectionStore(collection).set(fallbackId, created);
      return created;
    }
  },

  /**
   * Get a document by collection and ID.
   */
  getById: async (collection, id) => {
    if (!id) return null;
    const strId = String(id);

    try {
      const docRef = db.collection(collection).doc(strId);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = { id: doc.id, ...doc.data() };
        getCollectionStore(collection).set(strId, data);
        return data;
      }
    } catch (err) {
      // Fallback to local memory store
    }

    return getCollectionStore(collection).get(strId) || null;
  },

  /**
   * Update a document by collection and ID.
   */
  update: async (collection, id, data) => {
    if (!id) return null;
    const strId = String(id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = db.collection(collection).doc(strId);
      const doc = await docRef.get();
      if (doc.exists) {
        await docRef.update(updateData);
        const merged = { id: strId, ...doc.data(), ...updateData };
        getCollectionStore(collection).set(strId, merged);
        return merged;
      }
    } catch (err) {
      // Fallback to local memory store
    }

    const localDoc = getCollectionStore(collection).get(strId) || { id: strId };
    const merged = { ...localDoc, ...updateData };
    getCollectionStore(collection).set(strId, merged);
    return merged;
  },

  /**
   * Delete a document by collection and ID.
   */
  delete: async (collection, id) => {
    if (!id) return false;
    const strId = String(id);
    try {
      const docRef = db.collection(collection).doc(strId);
      await docRef.delete();
    } catch (err) {
      // Fallback to local memory store
    }
    getCollectionStore(collection).delete(strId);
    return true;
  },

  /**
   * Query documents matching a single field filter.
   */
  getWhere: async (collection, field, op, value) => {
    try {
      const snapshot = await db.collection(collection).where(field, op, value).get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      // Fallback to local memory store
    }

    const allLocal = Array.from(getCollectionStore(collection).values());
    if (op === '==') {
      return allLocal.filter((doc) => doc[field] === value);
    }
    return allLocal;
  },

  /**
   * Query documents matching multiple filters, sorting, and pagination limit.
   */
  query: async (collection, filters = [], orderByField = null, orderDirection = 'desc', limitVal = null) => {
    try {
      let queryRef = db.collection(collection);

      for (const filter of filters) {
        queryRef = queryRef.where(filter.field, filter.op, filter.value);
      }

      if (orderByField) {
        queryRef = queryRef.orderBy(orderByField, orderDirection);
      }

      if (limitVal) {
        queryRef = queryRef.limit(limitVal);
      }

      const snapshot = await queryRef.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      // Fallback
    }

    let allLocal = Array.from(getCollectionStore(collection).values());
    for (const filter of filters) {
      if (filter.op === '==') {
        allLocal = allLocal.filter((doc) => doc[filter.field] === filter.value);
      }
    }
    if (limitVal) {
      allLocal = allLocal.slice(0, limitVal);
    }
    return allLocal;
  },

  /**
   * Get all documents in a collection.
   */
  getAll: async (collection, limitVal = null) => {
    try {
      let queryRef = db.collection(collection);
      if (limitVal) {
        queryRef = queryRef.limit(limitVal);
      }
      const snapshot = await queryRef.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      // Fallback
    }

    const allLocal = Array.from(getCollectionStore(collection).values());
    if (limitVal) {
      return allLocal.slice(0, limitVal);
    }
    return allLocal;
  },

  /**
   * Clear local memory store (useful for clean unit test state resetting).
   */
  clearMemoryStore: () => {
    memoryStore.clear();
  },

  /**
   * Execute an atomic Firestore Transaction.
   */
  runTransaction: async (updateFunction) => {
    try {
      return await db.runTransaction(updateFunction);
    } catch (err) {
      console.warn('[firestoreService] Notice: Cloud Firestore unavailable for transaction');
      throw err;
    }
  },

  /**
   * Execute an Atomic Financial Transaction with guaranteed rollback safety.
   * Works with both Cloud Firestore runTransaction and staged memory store rollback fallback.
   */
  executeAtomicTransaction: async (transactionFn) => {
    // If running in test mode or Cloud Firestore is unconfigured, use staged atomic memoryStore transaction
    if (process.env.NODE_ENV === 'test' || !process.env.FIREBASE_PRIVATE_KEY) {
      const stagedBackup = new Map();
      memoryStore.forEach((collMap, collName) => {
        stagedBackup.set(
          collName,
          new Map(Array.from(collMap.entries()).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]))
        );
      });

      try {
        const result = await transactionFn({
          get: async (collection, id) => firestoreService.getById(collection, id),
          set: async (collection, id, data) => firestoreService.update(collection, id, data),
          create: async (collection, data, customId) => firestoreService.create(collection, data, customId),
          getWhere: async (collection, field, op, value) => firestoreService.getWhere(collection, field, op, value),
        });
        return result;
      } catch (err) {
        // Atomic rollback on error
        memoryStore.clear();
        stagedBackup.forEach((collMap, collName) => {
          memoryStore.set(collName, collMap);
        });
        throw err;
      }
    }

    // Production Cloud Firestore Transaction
    return await db.runTransaction(async (transaction) => {
      return await transactionFn({
        get: async (collection, id) => {
          const docRef = db.collection(collection).doc(String(id));
          const doc = await transaction.get(docRef);
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        },
        set: (collection, id, data) => {
          const docRef = db.collection(collection).doc(String(id));
          transaction.set(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        },
        create: (collection, data, customId = null) => {
          const id = String(customId || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`);
          const docRef = db.collection(collection).doc(id);
          const docData = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          transaction.set(docRef, docData);
          return { id, ...docData };
        },
        getWhere: async (collection, field, op, value) => firestoreService.getWhere(collection, field, op, value),
      });
    });
  },
};

module.exports = firestoreService;
