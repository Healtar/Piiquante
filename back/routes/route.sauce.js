const express = require('express');
const router = express.Router();

// middlewares
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');

// Controllers
const sauceCtrl = require('../controllers/controller.sauce');


// Create
router.post(  '/',         auth, multer, sauceCtrl.createSauce);

// Read
router.get(   '/',         auth,         sauceCtrl.getAllSauce);
router.get(   '/:id',      auth,         sauceCtrl.getOneSauce);

// Update
router.post(  '/:id/like', auth,         sauceCtrl.likeSauce);
router.put(   '/:id',      auth, multer, sauceCtrl.updateSauce);

// Delete
router.delete('/:id',      auth,         sauceCtrl.deleteSauce);

module.exports = router;

