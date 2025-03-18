const banners = require("../../models/banner.model");
const { validationResult } = require("express-validator");
const logger = require("../../../utils/logger");
var path = require("path");
const fs = require("fs");
const {
  bannersSingleCollection,
  bannersCollection,
} = require("../collection/bannerCollection");

//////////////////////////////////////// Get All Banners (With Pagination, Excluding Soft Deleted)////////////////////////////////////////////
exports.getRecords = async (req, res) => {
  try {
    let { page, limit, search } = req.query;
    page = parseInt(page) || 1; // Default to page 1
    limit = parseInt(limit) || 50; // Default limit 10

    const skip = (page - 1) * limit;

    // Construct search filters
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, "i") } }, // Case-insensitive search by name
      ];
    }
    const totalRecords = await banners.countDocuments(query);

    const records = await banners
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(); // Sort by latest records

    return res.status(200).json({
      status: true,
      message: "banners list",
      data: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        records: bannersCollection(records),
      },
    });
  } catch (error) {
    logger.error(
      `BannersController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
///////////////////////////////////////////////////////////Create Banner//////////////////////////////////////////////////////////////
exports.createRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,errors: errors.array(), message: "Validation error",data: null,
      });
    }
    const { title, discount } = req.body;
    const record = new banners({title, discount, imageURL: req.file.filename,
    });
    await record.save();
    return res.status(201).json({status: true, message: "banners created successfully", data: bannersSingleCollection(record),
    });
  } catch (error) {
    logger.error(
      `BannersController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
    res.status(500).json({ status: false, message: error.message, data: null });
  }
};
// Get Single Banner by ID
exports.getRecordById = async (req, res) => {
  try {
    // Fetch the record by ID 
    const record = await banners.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    // Check if the banner is soft deleted
    if (record.isDeleted) {
      return res.status(400).json({ status: false, message: "Banner is soft deleted", data: null });
    }

    return res.status(200).json({
      status: true,
      message: "Banner viewed successfully",
      data: bannersSingleCollection(record),
    });

  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};

/////////////////////////////////////////////////////////Update Banner//////////////////////////////////////////////////////////////
exports.updateRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false,errors: errors.array(),message: "Validation error",data: null,
      });
    }

    const { title, discount } = req.body;
   // find the banner by Id
    const img = await banners.findOne({ _id: req.params.id });
//check the old Path
    const oldImagePath = path.join(__dirname,"../../../../public/banners",img.imageURL);
  
    //check existence the remove the previous image and add new updated image
    if (fs.existsSync(oldImagePath)) {
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.log("error occur ");
        }
      });
    }
// update the Banners
    const updatedRecord = await banners.findByIdAndUpdate(
      req.params.id,
      { title, discount, imageURL: req.file.filename},
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
    return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }
    return res.status(200).json({status: true, message: "Banner updated successfully", data: bannersSingleCollection(updatedRecord),
    });
  } catch (error) {
    logger.error(
      `BannersController - Request ${JSON.stringify(req.params)} Error: ${
        error.message
      }`
    );
   return res.status(500).json({ status: false, message: error.message, data: null });
  }
};
///////////////////////////////////////////////////////// Soft Delete Banner//////////////////////////////////////////////////////////////
exports.softDeleteRecord = async (req, res) => {
  try {
    // Fetch the record by ID
    const record = await banners.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    // Check if the banner is already soft deleted
    if (record.isDeleted) {
      return res.status(400).json({ status: false, message: "Banner is already soft deleted", data: null });
    }

    // Proceed to soft delete the banner
    record.isDeleted = true;
    record.deletedAt = new Date();
    await record.save();

    return res.status(200).json({ 
      status: true, 
      message: "Banner soft deleted successfully", 
      data: bannersSingleCollection(record) 
    });

  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};

/////////////////////////////////////////////////// Restore Soft Deleted Banner////////////////////////////////////////////////////////////
exports.restoreRecord = async (req, res) => {
  try {
    const record = await banners.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ status: false, message: "Banner not found", data: null });
    }

    // Check if the banner is already restored
    if (!record.isDeleted) {
      return res.status(400).json({ status: false, message: "Banner is already restored", data: null });
    }

    // Now, update the banner to restore it
    record.isDeleted = false;
    record.deletedAt = null;
    await record.save();

    return res.status(200).json({ 
      status: true,
      message: "Banner restored successfully",
      data: bannersSingleCollection(record),
    });
  } catch (error) {
    logger.error(`BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`);
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};
/////////////////////////////////////////////////Permanently Delete Banner//////////////////////////////////////////////////////////////////
exports.permanentDeleteRecord = async (req, res) => {
  try {
   
    const record = await banners.findById(req.params.id);

    if (!record) {
      return res
        .status(404)
        .json({ status: false, message: "Banner not found", data: null });
    }

    // Check if the banner is already soft deleted
    if (record.isDeleted) {
      return res
        .status(400)
        .json({ status: false, message: "Banner is already soft deleted, please restore first before deleting permanently.", data: null });
    }

    
    const deletedRecord = await banners.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: true,
      message: "Banner permanently deleted",
      data: bannersSingleCollection(deletedRecord),
    });

  } catch (error) {
    logger.error(
      `BannersController - Request ${JSON.stringify(req.params)} Error: ${error.message}`
    );
    return res.status(500).json({ status: false, message: error.message, data: null });
  }
};

