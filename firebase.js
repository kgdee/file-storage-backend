import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore'

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)


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




const getFile = async (fileId) => {
  try {
    const docRef = doc(db, 'files', fileId);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists) {
      const docData = docSnap.data()
      return docData
    }
  
    return null 

  } catch (error) {
    console.error(error)
  }
}

const uploadFile = async (file, folderId, callback) => {
  try {
    // Initial callback to signal the start of the upload process
    callback(0);
    console.log(file.originalname, folderId);

    // Add file metadata to Firestore
    const fileRef = await addDoc(collection(db, 'files'), {
      name: file.originalname,
      folder: folderId,
      type: "file",
      createdAt: serverTimestamp()
    });

    // Create a reference to the storage location
    const storageRef = ref(storage, `files/${fileRef.id}/${file.originalname}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Monitor upload progress
    uploadTask.on('state_changed', 
      (snapshot) => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 90;
        callback(percentage);
      }, 
      (error) => {
        console.error("Upload failed:", error);
        callback(null);
      },
      async () => {
        // Get download URL after upload is complete
        const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
        callback(95);

        // Update Firestore document with the file URL
        await updateDoc(fileRef, { url: fileUrl });
        callback(100);

        console.log("File uploaded successfully.");
        setTimeout(() => callback(null), 500);
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error)
  }
};

const deleteFile = async (fileId, callback) => {
  try {
    callback(0)
    const itemRef = storage.ref().child(`files/${fileId}`)
    const listResult = await itemRef.listAll();

    for (const fileRef of listResult.items) {
      await fileRef.delete();
      console.log(`${fileRef.name} deleted successfully`);
    }
    callback(50)
    const fileRef = db.collection("files").doc(fileId);
    await fileRef.delete();
    console.log(`File with ID ${fileId} successfully deleted.`);
    callback(100)
    setTimeout(()=>callback(null), 500);

  } catch (error) {
    console.error(error)
  }
}

// Function to list folders and files in a specific folder
const listFiles = (folderId, callback) => {
  let result = { folders: [], files: [] }

  // Cleanup previous listeners
  if (currentListeners.foldersListener) currentListeners.foldersListener()
  if (currentListeners.filesListener) currentListeners.filesListener()

  try {
    // Listen for changes to the folders collection
    const foldersListener = db.collection("folders").where("parent", "==", folderId)
    .onSnapshot((querySnapshot) => {
      result.folders = []
      querySnapshot.forEach((doc) => {
        const folderData = doc.data();
        result.folders.push({ id: doc.id, name: folderData.name, type: folderData.type })
      });
      callback(result)
    });
    
    // Listen for changes to the files collection
    const filesListener = db.collection("files").where("folder", "==", folderId)
    .onSnapshot((querySnapshot) => {
      result.files = []
      querySnapshot.forEach((doc) => {
        const fileData = doc.data();
        result.files.push({ id: doc.id, name: fileData.name, url: fileData.url, type: fileData.type })
      });
      callback(result)
    });
    
    currentListeners = { foldersListener, filesListener }

  } catch (error) {
    console.error(error);
  }
}

const createTxt = async (data, folderId, callback) => {
  
  const { name, content } = data

  if (!content) return

  callback(0)

  const file = new File([content], `${name}.txt`, { type: "text/plain" });

  await uploadFile(file, folderId, ()=>{});

  callback(100)
  setTimeout(()=>callback(null), 500)
}


export default { getFolder, createFolder, deleteFolder, getFile, uploadFile, deleteFile, listFiles, createTxt }