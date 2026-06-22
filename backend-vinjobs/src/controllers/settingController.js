import Setting from '../models/Setting.js';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import imageService from '../services/ImageService.js';

class SettingController {
  // Lấy cấu hình hệ thống (Public)
  getSettings = asyncHandler(async (req, res, next) => {
    let settings = await Setting.findOne();
    if (!settings) {
      // Nếu chưa có thì tạo mặc định
      settings = await Setting.create({});
    }

    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  });

  // Cập nhật cấu hình (Admin only)
  updateSettings = asyncHandler(async (req, res, next) => {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const {
      site_name, seo_title, seo_description, seo_keywords,
      contact_email, contact_phone, address,
      facebook_url, linkedin_url,
      header_menu, footer_columns, footer_bottom_text
    } = req.body;

    if (site_name) settings.site_name = site_name;
    if (seo_title) settings.seo_title = seo_title;
    if (seo_description) settings.seo_description = seo_description;
    if (seo_keywords) settings.seo_keywords = seo_keywords;
    if (contact_email !== undefined) settings.contact_email = contact_email;
    if (contact_phone !== undefined) settings.contact_phone = contact_phone;
    if (address !== undefined) settings.address = address;
    if (facebook_url !== undefined) settings.facebook_url = facebook_url;
    if (linkedin_url !== undefined) settings.linkedin_url = linkedin_url;
    if (footer_bottom_text !== undefined) settings.footer_bottom_text = footer_bottom_text;

    try {
      if (header_menu) settings.header_menu = typeof header_menu === 'string' ? JSON.parse(header_menu) : header_menu;
      if (footer_columns) settings.footer_columns = typeof footer_columns === 'string' ? JSON.parse(footer_columns) : footer_columns;
    } catch (err) {
      return next(new AppError('Dữ liệu Menu hoặc Footer không hợp lệ (không phải JSON)', 400));
    }

    // Upload Files
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        // Banner/Logo max width 600px
        const logoUrl = await imageService.processAndSaveImage(req.files.logo[0].buffer, { maxWidth: 600 });
        settings.logo = logoUrl;
      }
      if (req.files.favicon && req.files.favicon[0]) {
        // Favicon vuông 100x100
        const faviconUrl = await imageService.processAndSaveImage(req.files.favicon[0].buffer, { isAvatar: true });
        settings.favicon = faviconUrl;
      }
    }

    await settings.save();

    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  });
}

export default new SettingController();
