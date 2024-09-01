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

export const createTxt = async (req, res) => {
  const { name, content, folderId } = req.body
  
  try {
    const result = await firebase.createTxt(name, content, folderId, ()=>{})
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
}