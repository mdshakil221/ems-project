import express from "express";
import {
  getEmployees, getEmployeeById,
  createEmployee, updateEmployee, deleteEmployee
} from "../controllers/employeeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getEmployees)
  .post(protect, adminOnly, createEmployee);

router.route("/:id")
  .get(protect, getEmployeeById)
  .put(protect, adminOnly, updateEmployee)
  .delete(protect, adminOnly, deleteEmployee);

export default router;