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
  const { file, folderId } = req.body
  try {
    const result = await firebase.uploadFile(file, folderId, ()=>{})
    res.status(201).send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

export const deleteFile = async (req, res) => {

}

export const listFiles = async (req, res) => {

}

export const createTxt = async (req, res) => {

}