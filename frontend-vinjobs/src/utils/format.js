export function formatSalary(min, max, negotiable) {
  if (negotiable || (!min && !max)) return 'Thoả thuận';
  const minText = ((min || 0) / 1_000_000).toFixed(0);
  const maxText = ((max || 0) / 1_000_000).toFixed(0);
  if (minText === '0') return `Lên đến ${maxText} triệu`;
  if (maxText === '0' || maxText === 'Infinity') return `Từ ${minText} triệu`;
  return `${minText} – ${maxText} triệu`;
}

export function formatSalaryFull(min, max, negotiable) {
  if (negotiable || (!min && !max)) return 'Thoả thuận';
  const minText = ((min || 0) / 1_000_000).toFixed(0);
  const maxText = ((max || 0) / 1_000_000).toFixed(0);
  if (minText === '0') return `Lên đến ${maxText} triệu/tháng`;
  if (maxText === '0' || maxText === 'Infinity') return `Từ ${minText} triệu/tháng`;
  return `${minText} – ${maxText} triệu/tháng`;
}

export const jobTypeLabels = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  REMOTE: 'Làm từ xa',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập sinh',
  FREELANCE: 'Cộng tác viên / Freelance'
};

export const jobLevelLabels = {
  INTERN: 'Thực tập sinh',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead / Trưởng nhóm',
  MANAGER: 'Manager'
};
