const bannners = require("../../models/banner.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");

const { bannersSingleCollection, bannersCollection } = require("../collection/bannerCollection");

// Get All Users (With Pagination, Excluding Soft Deleted)
exports.getRecords = async (req, res) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10

    const skip = (page - 1) * limit;

    // Construct search filters
    let query = { };

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, "i") } },  // Case-insensitive search by name
       
      ];
    }


    const totalRecords = await bannners.countDocuments(query);

    const records = await bannners.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }).lean(); // Sort by latest records

    res.status(200).json({
      status: true,
      message: "bannners list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: bannersCollection(records),
      },
    });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Create User
exports.createRecord = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: false,
                errors: errors.array(),
                message: "Validation error",
                data: null,
            });
        }
        
        console.log(req.file);
        
        const { title, discount } = req.body;
        
        // Check if req.file exists before accessing its properties
        const imagePath = req.file ? req.file.path : null;
        const imageOriginalName = req.file ? req.file.originalname : null;
        
        const record = new bannners({
            title,
            discount,
            imageURL: imageOriginalName // Use the checked originalname
        });
        
        await record.save();
        
        res
            .status(201)
            .json({ status: true, message: "bannners created successfully", data: bannersSingleCollection(record) });
    } catch (error) {
        logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
        res.status(500).json({ status: false, message: error.message, data: null });
    }
};
// Get Single User by ID
exports.getRecordById = async (req, res) => {
  try {
    const record = await bannners.findById(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "bannners not found", data: null });
    }
    res.status(200).json({
      status: true,
      message: "bannners view successfully",
      data: bannersSingleCollection(record),
    });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Update User
exports.updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }
    console.log(req.file);
        
    const { title, discount } = req.body;
    
    // Check if req.file exists before accessing its properties
    const imagePath = req.file ? req.file.path : null;
    const imageOriginalName = req.file ? req.file.originalname : null;
    const updatedRecord = await bannners.findByIdAndUpdate(req.params.id,  { title, discount,imageURL:imageOriginalName }, {
      new: true,
      runValidators: true,
    });
    if (!updatedRecord) {
      return res
        .status(404)
        .json({ status: false, message: "bannners not found", data: null });
    }
    res.status(200).json({
      status: true,
      message: "bannners updated successfully",
      data: bannersSingleCollection(updatedRecord),
    });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Soft Delete User
exports.softDeleteRecord = async (req, res) => {
  try {
    const record = await bannners.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "bannners not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "bannners soft deleted", data: bannersSingleCollection(record) });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Restore Soft Deleted User
exports.restoreRecord = async (req, res) => {
  try {
    const record = await bannners.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "bannners not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "bannners restored", data: bannersSingleCollection(record) });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Permanently Delete User
exports.permanentDeleteRecord = async (req, res) => {
  try {
    const record = await bannners.findByIdAndDelete(req.params.id);
    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "bannners not found", data: null });
    }
    res
      .status(200)
      .json({ status: true, message: "bannners permanently deleted", data: bannersSingleCollection(record) });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};


// Update Banner
exports.updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { title, discount } = req.body;

    // Purani image ko database se dhundho
    const img = await banners.findOne({ _id: req.params.id });
    if (!img) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    // Jo folder mein image padi hai uska path banao
    const oldImagePath = path.join(__dirname, "../../../../public/banners", img.imageURL);

    // Agar nayi file upload hui hai toh purani file delete kar do
    if (req.file) {
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Purani image ko delete kar diya
      }
    }

    // Nayi file ka naam ya purani file ka naam rakhna
    const imageOriginalName = req.file ? req.file.originalname : img.imageURL;

    // Nayi file ko save karna
    if (req.file) {
      const newImagePath = path.join(__dirname, "../../../../public/banners", imageOriginalName);
      fs.renameSync(req.file.path, newImagePath); // Nayi file ko rename kar ke purani wali ke naam par rakh do
    }

    // Record update karna database mein
    const updatedRecord = await banners.findByIdAndUpdate(
      req.params.id,
      { title, discount, imageURL: imageOriginalName },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Banner updated successfully",
      data: bannersSingleCollection(updatedRecord),
    });

  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};

// Update Banner
exports.updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { title, discount } = req.body;

    // Database se record find karen
    const existingRecord = await banners.findById(req.params.id);
    if (!existingRecord) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    // Agar naya image upload ho raha hai
    if (req.file) {
      const oldImagePath = path.join(__dirname, "../../../../public/banners", existingRecord.imageURL);
      
      // Agar purani file exist kar rahi hai toh use delete kar do
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      // Naya image ko save karna
      const newImageOriginalName = req.file.originalname;
      const newImagePath = path.join(__dirname, "../../../../public/banners", newImageOriginalName);

      fs.renameSync(req.file.path, newImagePath); // Naye image ko uski jagah par rakh do

      // Database mein updated record save karna
      existingRecord.title = title;
      existingRecord.discount = discount;
      existingRecord.imageURL = newImageOriginalName; // Naya image URL update kar do
    } else {
      // Agar image upload nahi ho raha toh sirf title aur discount update ho
      existingRecord.title = title;
      existingRecord.discount = discount;
    }

    await existingRecord.save();

    return res.status(200).json({
      status: true,
      message: "Banner updated successfully",
      data: bannersSingleCollection(existingRecord),
    });

  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
