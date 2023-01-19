const express = require('express');
const router = express.Router();

// middlewares
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

// Controllers
const sauceCtrl = require('../controllers/sauce');


// Create
router.post(  '/',         auth, multer, sauceCtrl.createSauce);
router.post(  '/:id/like', auth,         sauceCtrl.likeSauce);

// Read
router.get(   '/',         auth,         sauceCtrl.getAllSauce);
router.get(   '/:id',      auth,         sauceCtrl.getOneSauce);

// Update
router.put(   '/:id',      auth, multer, sauceCtrl.updateSauce);

// Delete
router.delete('/:id',      auth,         sauceCtrl.deleteSauce);

module.exports = router;