import companyService from '../services/CompanyService.js';
import asyncHandler from 'express-async-handler';

class CompanyController {
  createCompany = asyncHandler(async (req, res) => {
    const company = await companyService.createCompany(req.user.id, req.body);
    res.status(201).json({ status: 'success', data: { company } });
  });

  updateCompany = asyncHandler(async (req, res) => {
    const company = await companyService.updateCompany(req.user.id, req.body);
    res.status(200).json({ status: 'success', data: { company } });
  });

  getMyCompany = asyncHandler(async (req, res) => {
    const company = await companyService.getCompanyByEmployer(req.user.id);
    res.status(200).json({ status: 'success', data: { company } });
  });

  getCompanies = asyncHandler(async (req, res) => {
    const { companies, pagination } = await companyService.getCompanies(req.query);
    res.status(200).json({ status: 'success', results: companies.length, data: { companies, pagination } });
  });

  getCompany = asyncHandler(async (req, res) => {
    const { company, activeJobs } = await companyService.getCompanyById(req.params.id);
    res.status(200).json({ status: 'success', data: { company, activeJobs } });
  });

  getTopCompanies = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const companies = await companyService.getTopCompanies(limit);
    res.status(200).json({ status: 'success', results: companies.length, data: { companies } });
  });
}

export default new CompanyController();
