import firebase from '../firebase.js'

export const getFolder = async (req, res) => {
  const folderId = req.params.id;
  try {
    const folder = await firebase.getFolder(folderId);
    res.status(200).json(folder);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createFolder = async (req, res) => {
  const { folderName, parentFolderId = null } = req.body;
  try {
    const result = await firebase.createFolder(folderName, parentFolderId);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteFolder = async (req, res) => {
  const folderId = req.params.id;
  try {
    const result = await firebase.deleteFolder(folderId);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
