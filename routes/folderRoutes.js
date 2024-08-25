import express from 'express'
import { getFolder, createFolder, deleteFolder } from '../controllers/folderController.js'

const router = express.Router();

router.get('/:id', getFolder);
router.post('/', createFolder);
router.delete('/:id', deleteFolder);

export default router