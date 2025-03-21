const fs = require('fs');
const path = require('path');
const banners = require('../../models/banner.model'); // Adjust the path as per your structure
const { fileUploadHandler } = require('../../../helper/uploadHelper');

exports.update = async (req) => {
    const { title, discount, imageURL } = req.body;
    const existingRecord = await banners.findById(req.params.id);

    if (!existingRecord) return { error: "This Banner Does Not Exist", statusCode: 404 };
    
    let newImagePath = existingRecord.imageURL; // Keep old image if no new one is provided

    if (imageURL) {
        newImagePath = await fileUploadHandler(imageURL, 'banners');
        
        // Remove old image if it exists
        if (existingRecord.imageURL) {
            const oldImagePath = path.join(process.cwd(), `public/banners/${existingRecord.imageURL}`);
            if (fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath);
        }
    }

    existingRecord.title = title;
    existingRecord.discount = discount;
    existingRecord.imageURL = newImagePath;
    await existingRecord.save();

    return { data: existingRecord };
};

/////////////
const bannerService = require('../services/bannerService'); // Adjust path according to your structure

exports.updateRecord = async (req, res) => {
    try {
        const result = await bannerService.update(req);

        if (result.error) {
            return responseHandler.notFound(res, result.error, result.statusCode);
        }

        return responseHandler.success(res, "Banner updated successfully", result.data);
    } catch (error) {
        return responseHandler.error(res, error.message);
    }
};

///////////
const banners = require('../../models/banner.model'); // Adjust path according to your structure
const { fileUploadHandler } = require('../../../helper/uploadHelper');

exports.create = async (req) => {
    const { title, discount, imageURL } = req.body;

    if (!imageURL) return { error: "imageURL is required", statusCode: 400 };

    // Move the image from tempUploads to banners folder
    const finalImagePath = await fileUploadHandler(imageURL, 'banners');

    // Save the new banner in the database
    const record = new banners({
        title,
        discount,
        imageURL: finalImagePath
    });

    await record.save();

    return { data: record };
};

//////////////_
const bannerService = require('../services/bannerService'); // Adjust path according to your structure

exports.createRecord = async (req, res) => {
    try {
        const result = await bannerService.create(req);

        if (result.error) {
            return responseHandler.badRequest(res, result.error, result.statusCode);
        }

        return responseHandler.success(res, "Banner created successfully", result.data);
    } catch (error) {
        return responseHandler.error(res, error.message);
    }
};
