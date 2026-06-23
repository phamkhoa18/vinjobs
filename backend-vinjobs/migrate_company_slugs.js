import 'dotenv/config';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Company from './src/models/Company.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    const companies = await Company.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }] });
    console.log(`Found ${companies.length} companies without slug`);

    for (const company of companies) {
      let baseSlug = slugify(company.name, { lower: true, strict: true, locale: 'vi' });
      let slug = baseSlug;
      let slugExists = await Company.findOne({ slug, _id: { $ne: company._id } });
      let count = 1;
      while (slugExists) {
        slug = `${baseSlug}-${count}`;
        slugExists = await Company.findOne({ slug, _id: { $ne: company._id } });
        count++;
      }
      company.slug = slug;
      await company.save();
      console.log(`Updated company ${company._id} with slug: ${slug}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

run();
