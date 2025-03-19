const express = require('express');
const router = express.Router();
// const multer =require ('multer');

// controller
const AdminController = require('../controllers/admin.controller');
const UserController = require('../controllers/user.controller');
const CleaningServiceController = require('../controllers/cleaning-service.controller');
const CleanerController = require('../controllers/cleaner.controller');
const BannerController = require('../controllers/banner.controller')

// Validater 
const { validateRegister, validateLogin } = require('../validators/admin.validator');
const { validateUserRegister, validateUserUpdate } = require('../validators/user.validator');
const { validateCleaningService } =  require("../validators/cleaning-service.validator");
const { validateCleaner, validateCleanerUpdate } =  require("../validators/cleaner.validator");

// Middleware
const { AdminAuthMiddleware } = require('../../../middlewares/admin-auth.middleware');
const { upload_image } = require('../controllers/fileUpload.controller');


router.post('/register', validateRegister, AdminController.register);
router.post('/login', validateLogin, AdminController.login);


// User CRUD Routes
router.get("/users", AdminAuthMiddleware, UserController.getUsers);
router.post("/users/store", AdminAuthMiddleware, validateUserRegister, UserController.createUser);
router.get("/users/:id", AdminAuthMiddleware, UserController.getUserById);
router.put("/users/:id", AdminAuthMiddleware, validateUserUpdate, UserController.updateUser); // making status change in this api too.
router.delete("/users/:id", AdminAuthMiddleware, UserController.softDeleteUser); // Soft delete
router.patch("/users/:id/restore", AdminAuthMiddleware, UserController.restoreUser); // Restore

// Cleaning-service CRUD Routes
router.get("/cleaning-service", AdminAuthMiddleware, CleaningServiceController.getRecords);
router.post("/cleaning-service/store", AdminAuthMiddleware, validateCleaningService, CleaningServiceController.createRecord);
router.get("/cleaning-service/:id", AdminAuthMiddleware, CleaningServiceController.getRecordById);
router.put("/cleaning-service/:id", AdminAuthMiddleware, validateCleaningService, CleaningServiceController.updateRecord); // making status change in this api too.
router.delete("/cleaning-service/:id", AdminAuthMiddleware, CleaningServiceController.softDeleteRecord); // Soft delete
router.patch("/cleaning-service/:id/restore", AdminAuthMiddleware, CleaningServiceController.restoreRecord); // Restore

// Cleaning-service CRUD Routes
router.get("/cleaners", AdminAuthMiddleware, CleanerController.getRecords);
router.post("/cleaners/store", AdminAuthMiddleware, validateCleaner, CleanerController.createRecord);
router.get("/cleaners/:id", AdminAuthMiddleware, CleanerController.getRecordById);
router.put("/cleaners/:id", AdminAuthMiddleware, validateCleanerUpdate, CleanerController.updateRecord); // making status change in this api too.
router.delete("/cleaners/:id", AdminAuthMiddleware, CleanerController.softDeleteRecord); // Soft delete
router.patch("/cleaners/:id/restore", AdminAuthMiddleware, CleanerController.restoreRecord); // Restore

//banners Crud Routes
router.get("/banners",AdminAuthMiddleware,BannerController.getRecords);
router.post('/banners/create',BannerController.createRecord);
router.get("/banners/:id",AdminAuthMiddleware,BannerController.getRecordById);
router.put('/banners/:id',AdminAuthMiddleware,BannerController.updateRecord);
router.delete('/banners/:id',AdminAuthMiddleware,BannerController.softDeleteRecord);
router.patch('/banners/:id',AdminAuthMiddleware,BannerController.restoreRecord)
router.post('/upload_image',upload_image)
module.exports = router;