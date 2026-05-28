class ApiFeatures {
  constructor(queryString, queryObj = {}) {
    this.queryString = queryString;
    this.query = queryObj.find();
  }

  filter(filters) {
    let filterStr = JSON.parse(JSON.stringify(filters));
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete filterStr[el]);
    filterStr = JSON.stringify(filterStr).replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    
    this.query = this.query.find(JSON.parse(filterStr));
    return this;
  }

  search(field) {
    if (this.queryString.q) {
      this.query = this.query.find({ [field]: new RegExp(this.queryString.q, 'i') });
    }
    return this;
  }
        
  sort(defaultSort = '-createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
    }
    return this;
  }
  
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  select() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

module.exports = ApiFeatures;