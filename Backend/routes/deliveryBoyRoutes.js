const express = require("express");
const router = express.Router();
const {
  getDeliveryBoys,
  getDeliveryBoyById,
  createDeliveryBoy,
  updateDeliveryBoy,
  toggleDeliveryBoyStatus,
  deleteDeliveryBoy,
} = require("../controllers/deliveryBoyController");

router.route("/").get(getDeliveryBoys).post(createDeliveryBoy);

router
  .route("/:id")
  .get(getDeliveryBoyById)
  .put(updateDeliveryBoy)
  .delete(deleteDeliveryBoy);

router.route("/:id/status").patch(toggleDeliveryBoyStatus);

module.exports = router;

