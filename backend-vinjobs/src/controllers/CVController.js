import cvService from '../services/CVService.js';
import asyncHandler from 'express-async-handler';

class CVController {
  uploadCV = asyncHandler(async (req, res) => {
    // Đã giả định URL được truyền lên trong req.body.file_path
    const cv = await cvService.uploadCV(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { cv } });
  });

  getMyCVs = asyncHandler(async (req, res) => {
    const cvs = await cvService.getMyCVs(req.user.id);
    res.status(200).json({ status: 'success', results: cvs.length, data: { cvs } });
  });
}

export default new CVController();
