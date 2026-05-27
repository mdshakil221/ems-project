import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";
import { createNotification } from "./notificationController.js";
import { createLog } from "./activityLogController.js";

// সব বেতন দেখুন
export const getSalaries = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;
    const salaries = await Salary.find(filter).sort({ createdAt: -1 });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// মাসিক বেতন Generate করুন
export const generateSalaries = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: "মাস ও বছর দিন!" });
    }

    const employees = await Employee.find({ status: "active" });

    if (employees.length === 0) {
      return res.status(400).json({ message: "কোনো সক্রিয় কর্মী নেই!" });
    }

    const generated = [];
    const existing = [];

    for (const emp of employees) {
      const alreadyExists = await Salary.findOne({
        employeeId: emp._id, month, year
      });

      if (!alreadyExists) {
        const salary = await Salary.create({
          employeeId: emp._id,
          employeeName: emp.name,
          basicSalary: Number(emp.salary),
          bonus: 0,
          deduction: 0,
          netSalary: Number(emp.salary),
          month,
          year,
          status: "unpaid"
        });
        generated.push(salary);
      } else {
        existing.push(emp.name);
      }
    }

    if (generated.length === 0) {
      return res.status(400).json({
        message: `${month}/${year} মাসে সব কর্মীর বেতন আগেই তৈরি হয়েছে!`
      });
    }
    await createLog(
      req.user._id, req.user.name, req.user.role,
      `${month}/${year} মাসের Salary Generate করেছে`,
      "salary",
      `${generated.length} জন কর্মীর বেতন তৈরি`
    );

    res.status(201).json({
      message: `${generated.length} জন কর্মীর বেতন তৈরি হয়েছে!`,
      salaries: generated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// বেতন আপডেট করুন
export const updateSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "বেতন পাওয়া যায়নি!" });
    }
    salary.bonus = req.body.bonus ?? salary.bonus;
    salary.deduction = req.body.deduction ?? salary.deduction;
    salary.netSalary = salary.basicSalary + salary.bonus - salary.deduction;
    const updated = await salary.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// বেতন পরিশোধ করুন
export const paySalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: "বেতন পাওয়া যায়নি!" });
    }
    salary.status = "paid";
    salary.paidAt = new Date();
    await salary.save();

    await createLog(
      req.user._id, req.user.name, req.user.role,
      `${salary.employeeName} এর বেতন পরিশোধ করেছে`,
      "salary",
      `Amount: ৳${salary.netSalary}, Month: ${salary.month}/${salary.year}`
    );
    await createNotification(
      `💰 ${salary.employeeName} এর ${salary.month}/${salary.year} মাসের বেতন ৳${salary.netSalary.toLocaleString()} পরিশোধ হয়েছে!`,
      "salary"
    );
    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Employee এর নিজের বেতন দেখুন
export const getMySalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({
      employeeName: req.user.name
    }).sort({ createdAt: -1 });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};