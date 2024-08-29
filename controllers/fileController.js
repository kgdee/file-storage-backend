import firebase from '../firebase.js'

export const getFile = async (req, res) => {
  const fileId = req.params.id
  try {
    const file = await firebase.getFile(fileId)
    res.status(200).json(file)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

export const uploadFile = async (req, res) => {
  
  if (!req.file) return res.status(400).send('No file uploaded.');
  const folderId = req.body.folderId || null
  try {
    const result = await firebase.uploadFile(req.file, folderId, ()=>{})
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

export const deleteFile = async (req, res) => {
  try {
    const result = await firebase.deleteFile(req.params.id, ()=>{})
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

export const listFiles = async (req, res) => {
  try {
    const folderId = req.params.id === "null" ? null : req.params.id
    const result = await firebase.listFiles(folderId)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

export const createTxt = async (req, res) => {

}