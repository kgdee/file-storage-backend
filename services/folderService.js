import { db, storage } from '../config/firebaseConfig.js'
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore'

// Retrieve a folder by ID
const getFolder = async (folderId) => {
  if (!folderId) return { id: null, name: "My Drive", path: null, type: "root" };

  try {
    const docRef = doc(db, 'folders', folderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      const docData = docSnap.data();
      const folder = { id: docSnap.id, name: docData.name, path: docData.path };
      return folder;
    }

    return null;
  } catch (error) {
    console.error(error);
    throw new Error('Could not retrieve folder');
  }
};

// Create a new folder
const createFolder = async (folderName, parentFolderId, callback) => {
  try {
    callback(0);
    let path = [];

    if (parentFolderId) {
      const parentFolder = await getFolder(parentFolderId);
      path = [...parentFolder.path, parentFolderId];
    }

    callback(50);

    const folderRef = await addDoc(collection(db, 'folders'), {
      name: folderName,
      parent: parentFolderId,
      path: path,
      type: 'folder',
      createdAt: serverTimestamp(),
    })

    console.log('Folder created with ID:', folderRef.id);
    callback(100);
    return { id: folderRef.id, name: folderName, parent: parentFolderId };
  } catch (error) {
    console.error(error);
    throw new Error('Could not create folder');
  }
};

// Delete a folder by ID
const deleteFolder = async (folderId, callback) => {
  try {
    callback(0);

    const q = query(collection(db, 'folders'), where('path', 'array-contains', folderId));
    const querySnapshot = await getDocs(q)

    for (let i = 0; i < querySnapshot.size; i++) {
      const doc = querySnapshot.docs[i];
      await deleteFilesInFolder(doc.id);
      await deleteFolderDoc(doc.id);

      callback((90 / querySnapshot.size) * (i + 1));
    }

    await deleteFilesInFolder(folderId);
    await deleteFolderDoc(folderId);

    callback(100);
    return `Folder with ID ${folderId} successfully deleted.`;
  } catch (error) {
    console.error(error);
    throw new Error('Could not delete folder');
  }
};

// Helper function to delete files in a folder
const deleteFilesInFolder = async (folderId) => {
  try {
    const q = query(collection(db, 'files'), where('folder', '==', folderId));
    const querySnapshot = await getDocs(q)

    for (const doc of querySnapshot.docs) {
      await deleteFile(doc.id, () => {});
    }
  } catch (error) {
    console.error(error);
    throw new Error('Could not delete files in folder');
  }
};

// Helper function to delete a folder document
const deleteFolderDoc = async (folderId) => {
  try {
    await deleteDoc(doc(db, "folders", folderId));

    console.log(`Folder with ID ${folderId} successfully deleted.`);
  } catch (error) {
    console.error(error);
    throw new Error('Could not delete folder document');
  }
};

export default { getFolder, createFolder, deleteFolder }