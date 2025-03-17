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
