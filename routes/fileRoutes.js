import express from 'express'
import { getFile, uploadFile, deleteFile, listFiles, createTxt } from '../controllers/fileController.js'

const router = express.Router();

router.get('/:id', getFile);
router.post('/', uploadFile);
router.delete('/:id', deleteFile);
router.get('/folder/:folderId', listFiles);
router.post('/txt', createTxt)


export default router