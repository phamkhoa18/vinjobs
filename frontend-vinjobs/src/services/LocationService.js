

/**
 * Service lấy dữ liệu Hành chính Việt Nam (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã)
 * Dựa trên API miễn phí: https://provinces.open-api.vn/
 */
class LocationService {
  constructor() {
    this.baseURL = 'https://provinces.open-api.vn/api';
    // Caching để giảm số lần gọi API
    this.provincesCache = null;
    this.districtsCache = {};
    this.wardsCache = {};
  }

  /**
   * Lấy danh sách Tỉnh/Thành phố
   * @returns {Promise<Array>}
   */
  async getProvinces() {
    if (this.provincesCache) return this.provincesCache;
    try {
      const response = await fetch(`${this.baseURL}/?depth=1`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.provincesCache = data;
      return this.provincesCache;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback data nếu API lỗi
      return [
        { code: 1, name: 'Hà Nội' },
        { code: 79, name: 'Hồ Chí Minh' },
        { code: 48, name: 'Đà Nẵng' },
        { code: 92, name: 'Cần Thơ' },
        { code: 31, name: 'Hải Phòng' }
      ];
    }
  }

  /**
   * Lấy danh sách Quận/Huyện theo mã Tỉnh/Thành phố
   * @param {number} provinceCode 
   * @returns {Promise<Array>}
   */
  async getDistricts(provinceCode) {
    if (!provinceCode) return [];
    if (this.districtsCache[provinceCode]) return this.districtsCache[provinceCode];
    try {
      const response = await fetch(`${this.baseURL}/p/${provinceCode}?depth=2`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.districtsCache[provinceCode] = data.districts;
      return this.districtsCache[provinceCode];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách Phường/Xã theo mã Quận/Huyện
   * @param {number} districtCode 
   * @returns {Promise<Array>}
   */
  async getWards(districtCode) {
    if (!districtCode) return [];
    if (this.wardsCache[districtCode]) return this.wardsCache[districtCode];
    try {
      const response = await fetch(`${this.baseURL}/d/${districtCode}?depth=2`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.wardsCache[districtCode] = data.wards;
      return this.wardsCache[districtCode];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  }
}

export default new LocationService();
