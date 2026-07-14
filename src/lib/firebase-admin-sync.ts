import fs from 'fs';
import path from 'path';
import { adminDb, adminDbDefault } from './firebase-admin.ts';

// Keep track of the currently active/working Firestore database instance
let currentDb = adminDb;

export async function seedFirestore(localDb: any) {
  try {
    console.log('Seeding Firestore from local database...');
    const batch = currentDb.batch();
    let opsCount = 0;

    const commitBatch = async () => {
      if (opsCount > 0) {
        await batch.commit();
        opsCount = 0;
      }
    };

    // Users
    if (localDb.users) {
      for (const email of Object.keys(localDb.users)) {
        batch.set(currentDb.collection('users').doc(email), localDb.users[email]);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Devices
    if (localDb.devices) {
      for (const device of localDb.devices) {
        batch.set(currentDb.collection('devices').doc(device.id), device);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Weapons
    if (localDb.weapons) {
      for (const weapon of localDb.weapons) {
        batch.set(currentDb.collection('weapons').doc(weapon.id), weapon);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Marketplace Products
    if (localDb.marketplaceProducts) {
      for (const product of localDb.marketplaceProducts) {
        batch.set(currentDb.collection('marketplaceProducts').doc(product.id), product);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Community Posts
    if (localDb.communityPosts) {
      for (const post of localDb.communityPosts) {
        batch.set(currentDb.collection('communityPosts').doc(post.id), post);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // HUD Layouts
    if (localDb.hudLayouts) {
      for (const email of Object.keys(localDb.hudLayouts)) {
        batch.set(currentDb.collection('hudLayouts').doc(email), { layouts: localDb.hudLayouts[email] });
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Admin logs
    if (localDb.adminActivityLogs) {
      for (const log of localDb.adminActivityLogs) {
        batch.set(currentDb.collection('adminActivityLogs').doc(log.id), log);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Notifications
    if (localDb.notifications) {
      for (const notif of localDb.notifications) {
        batch.set(currentDb.collection('notifications').doc(notif.id), notif);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Vendor Tokens
    if (localDb.vendorTokens) {
      for (const token of localDb.vendorTokens) {
        batch.set(currentDb.collection('vendorTokens').doc(token.id), token);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    await commitBatch();
    console.log('Firestore seeding completed successfully.');
  } catch (error) {
    console.warn('Non-fatal warning seeding Firestore:', error);
  }
}

async function fetchAllCollections(dbInstance: any) {
  const db: any = {
    users: {},
    devices: [],
    weapons: [],
    marketplaceProducts: [],
    communityPosts: [],
    hudLayouts: {},
    adminActivityLogs: [],
    notifications: [],
    vendorTokens: []
  };

  // 1. Users
  const usersSnap = await dbInstance.collection('users').get();
  usersSnap.forEach((doc: any) => {
    db.users[doc.id] = doc.data();
  });

  // 2. Devices
  const devicesSnap = await dbInstance.collection('devices').get();
  devicesSnap.forEach((doc: any) => {
    db.devices.push(doc.data());
  });

  // 3. Weapons
  const weaponsSnap = await dbInstance.collection('weapons').get();
  weaponsSnap.forEach((doc: any) => {
    db.weapons.push(doc.data());
  });

  // 4. Marketplace Products
  const productsSnap = await dbInstance.collection('marketplaceProducts').get();
  productsSnap.forEach((doc: any) => {
    db.marketplaceProducts.push(doc.data());
  });

  // 5. Community Posts
  const postsSnap = await dbInstance.collection('communityPosts').get();
  postsSnap.forEach((doc: any) => {
    db.communityPosts.push(doc.data());
  });

  // 6. HUD Layouts
  const hudsSnap = await dbInstance.collection('hudLayouts').get();
  hudsSnap.forEach((doc: any) => {
    const data = doc.data();
    db.hudLayouts[doc.id] = data.layouts || [];
  });

  // 7. Admin Logs
  const logsSnap = await dbInstance.collection('adminActivityLogs').get();
  logsSnap.forEach((doc: any) => {
    db.adminActivityLogs.push(doc.data());
  });

  // 8. Notifications
  const notifsSnap = await dbInstance.collection('notifications').get();
  notifsSnap.forEach((doc: any) => {
    db.notifications.push(doc.data());
  });

  // 9. Vendor Tokens
  const tokensSnap = await dbInstance.collection('vendorTokens').get();
  tokensSnap.forEach((doc: any) => {
    db.vendorTokens.push(doc.data());
  });

  return db;
}

export async function loadFromFirestore() {
  try {
    console.log('Connecting and loading data from Firestore...');
    let db: any = null;

    try {
      db = await fetchAllCollections(currentDb);
    } catch (firstError: any) {
      if (currentDb !== adminDbDefault) {
        console.log(`Custom database was not accessible (${firstError.message || firstError}). Gracefully falling back to default database...`);
        currentDb = adminDbDefault;
        db = await fetchAllCollections(currentDb);
      } else {
        throw firstError;
      }
    }

    // Check if Firestore is totally empty. If so, seed from server_db.json
    const isFirestoreEmpty = Object.keys(db.users).length === 0 && db.devices.length === 0 && db.weapons.length === 0;
    if (isFirestoreEmpty) {
      const localDbPath = path.resolve(process.cwd(), 'server_db.json');
      if (fs.existsSync(localDbPath)) {
        console.log('Firestore is empty. Reading local seed file:', localDbPath);
        const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        await seedFirestore(localDb);
        return localDb;
      }
    }

    console.log('Successfully loaded database from Firestore.');
    return db;
  } catch (error: any) {
    console.log('Could not complete loading database from Firestore (will fall back to local JSON database):', error.message || error);
    return null;
  }
}

export async function saveToFirestore(newData: any, oldData: any) {
  try {
    const batch = currentDb.batch();
    let opsCount = 0;

    const commitBatch = async () => {
      if (opsCount > 0) {
        await batch.commit();
        opsCount = 0;
      }
    };

    // 1. Users
    const newEmails = Object.keys(newData.users || {});
    const oldEmails = Object.keys(oldData.users || {});

    for (const email of newEmails) {
      const newUserObj = newData.users[email];
      const oldUserObj = oldData.users ? oldData.users[email] : null;
      if (JSON.stringify(newUserObj) !== JSON.stringify(oldUserObj)) {
        batch.set(currentDb.collection('users').doc(email), newUserObj);
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }
    for (const email of oldEmails) {
      if (!newData.users[email]) {
        batch.delete(currentDb.collection('users').doc(email));
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    // Helper for array collections where each element has an "id"
    const syncArrayCollection = async (collName: string, newArr: any[], oldArr: any[]) => {
      const newMap = new Map(newArr.map(item => [item.id, item]));
      const oldMap = new Map((oldArr || []).map(item => [item.id, item]));

      for (const [id, item] of newMap.entries()) {
        const oldItem = oldMap.get(id);
        if (JSON.stringify(item) !== JSON.stringify(oldItem)) {
          batch.set(currentDb.collection(collName).doc(id), item);
          opsCount++;
          if (opsCount >= 400) await commitBatch();
        }
      }

      for (const id of oldMap.keys()) {
        if (!newMap.has(id)) {
          batch.delete(currentDb.collection(collName).doc(id));
          opsCount++;
          if (opsCount >= 400) await commitBatch();
        }
      }
    };

    // Arrays
    await syncArrayCollection('devices', newData.devices || [], oldData.devices || []);
    await syncArrayCollection('weapons', newData.weapons || [], oldData.weapons || []);
    await syncArrayCollection('marketplaceProducts', newData.marketplaceProducts || [], oldData.marketplaceProducts || []);
    await syncArrayCollection('communityPosts', newData.communityPosts || [], oldData.communityPosts || []);
    await syncArrayCollection('adminActivityLogs', newData.adminActivityLogs || [], oldData.adminActivityLogs || []);
    await syncArrayCollection('notifications', newData.notifications || [], oldData.notifications || []);
    await syncArrayCollection('vendorTokens', newData.vendorTokens || [], oldData.vendorTokens || []);

    // HUD Layouts
    const newHudEmails = Object.keys(newData.hudLayouts || {});
    const oldHudEmails = Object.keys(oldData.hudLayouts || {});

    for (const email of newHudEmails) {
      const newLayouts = newData.hudLayouts[email];
      const oldLayouts = oldData.hudLayouts ? oldData.hudLayouts[email] : null;
      if (JSON.stringify(newLayouts) !== JSON.stringify(oldLayouts)) {
        batch.set(currentDb.collection('hudLayouts').doc(email), { layouts: newLayouts });
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    for (const email of oldHudEmails) {
      if (!newData.hudLayouts[email]) {
        batch.delete(currentDb.collection('hudLayouts').doc(email));
        opsCount++;
        if (opsCount >= 400) await commitBatch();
      }
    }

    await commitBatch();
  } catch (error: any) {
    console.warn('Non-fatal notification: Local telemetry sync to Firebase Firestore database: ' + (error.message || error));
  }
}
