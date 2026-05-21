import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

export const getEmployees = async (req, res) => {
  const employees = await Employee.find({});
  res.json(employees);
};

export const getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ message: "কর্মী পাওয়া যায়নি!" });
  }
};

export const createEmployee = async (req, res) => {
  const { name, email, password, phone, department, position, salary, status, joinDate } = req.body;

  const exists = await Employee.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "এই Email আগে থেকে আছে!" });
  }

  // User account তৈরি
  const userExists = await User.findOne({ email });
  if (!userExists) {
    await User.create({ name, email, password, role: "employee" });
  }

  const avatar = name.split(" ").map(n => n[0]).join("").toUpperCase();

  // ✅ loginEmail ও loginPassword plain text এ store
  const employee = await Employee.create({
    name, email, phone, department,
    position, salary, status, joinDate, avatar,
    loginEmail: email,
    loginPassword: password, // plain text store
  });

  await Notification.create({
    message: `👤 নতুন কর্মী ${name} যোগ হয়েছে`,
    type: "employee"
  });

  res.status(201).json(employee);
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (employee) {
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.phone = req.body.phone || employee.phone;
    employee.department = req.body.department || employee.department;
    employee.position = req.body.position || employee.position;
    employee.salary = req.body.salary || employee.salary;
    employee.status = req.body.status || employee.status;
    employee.avatar = employee.name.split(" ").map(n => n[0]).join("").toUpperCase();

    // ✅ Password আপডেট হলে store করুন
    if (req.body.password) {
      employee.loginPassword = req.body.password;
      // User model এও আপডেট
      await User.findOneAndUpdate(
        { email: employee.email },
        { name: req.body.name || employee.name }
      );
    }

    const updated = await employee.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: "কর্মী পাওয়া যায়নি!" });
  }
};

export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (employee) {
    await User.findOneAndDelete({ email: employee.email });
    await employee.deleteOne();
    res.json({ message: "কর্মী ও Account মুছে ফেলা হয়েছে!" });
  } else {
    res.status(404).json({ message: "কর্মী পাওয়া যায়নি!" });
  }
};