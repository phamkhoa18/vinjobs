import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Job from './src/models/Job.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    const jobs = await Job.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] });
    console.log(`Found ${jobs.length} jobs without slug`);

    for (const job of jobs) {
      let baseSlug = slugify(job.title, { lower: true, strict: true, locale: 'vi' });
      let slug = baseSlug;
      let slugExists = await Job.findOne({ slug, _id: { $ne: job._id } });
      let count = 1;
      while (slugExists) {
        slug = `${baseSlug}-${count}`;
        slugExists = await Job.findOne({ slug, _id: { $ne: job._id } });
        count++;
      }
      job.slug = slug;
      await job.save();
      console.log(`Updated job ${job._id} with slug: ${slug}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

run();
