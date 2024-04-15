const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController'); // Import notificationController

// Endpoint để tạo thông báo
router.post('/', notificationController.createNotification);

// Endpoint để lấy thông báo dựa trên vai trò
router.get('/:role', notificationController.getNotificationsByRole);

router.get('/', notificationController.getAllNotifications);

module.exports = router;
