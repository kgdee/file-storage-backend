import express from 'express'
import { getFile, uploadFile, deleteFile, listFiles, createTxt } from '../controllers/fileController.js'

import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.get('/:id', getFile);
router.post('/', upload.single('file'), uploadFile);
router.delete('/:id', deleteFile);
router.get('/list/:id', listFiles);
router.post('/txt', createTxt)


export default router