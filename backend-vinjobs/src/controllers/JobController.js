import jobService from '../services/JobService.js';
import recruitmentFacade from '../facades/RecruitmentFacade.js';
import asyncHandler from 'express-async-handler';

class JobController {
  postJob = asyncHandler(async (req, res) => {
    const { companyId, ...jobData } = req.body;
    const job = await recruitmentFacade.postJob(req.user.id, companyId, jobData);
    res.status(201).json({ status: 'success', data: { job } });
  });

  searchJobs = asyncHandler(async (req, res) => {
    const { jobs, pagination } = await jobService.searchJobs(req.query);
    res.status(200).json({ status: 'success', results: jobs.length, data: { jobs, pagination } });
  });

  getJob = asyncHandler(async (req, res) => {
    const job = await jobService.getJobById(req.params.id);
    res.status(200).json({ status: 'success', data: { job } });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await jobService.getTopCategories();
    res.status(200).json({ status: 'success', results: categories.length, data: { categories } });
  });
}

export default new JobController();
