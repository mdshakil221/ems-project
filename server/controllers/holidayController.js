import Holiday from "../models/Holiday.js";

export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find({}).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;
    const existing = await Holiday.findOne({ date });
    if (existing) {
      return res.status(400).json({ message: "এই তারিখে আগে থেকে ছুটি আছে!" });
    }
    const holiday = await Holiday.create({ title, date, type, description });
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "ছুটি পাওয়া যায়নি!" });
    }
    holiday.title = req.body.title || holiday.title;
    holiday.date = req.body.date || holiday.date;
    holiday.type = req.body.type || holiday.type;
    holiday.description = req.body.description || holiday.description;
    const updated = await holiday.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "ছুটি পাওয়া যায়নি!" });
    }
    await holiday.deleteOne();
    res.json({ message: "ছুটি মুছে ফেলা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};