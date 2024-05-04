class APIFeature {
  constructor(query, queryStrings) {
    this.query = query;
    this.queryStrings = queryStrings;
  }
  filter() {
    const queryObj = { ...this.queryStrings };
    const exculdeFields = ['page', 'sort', 'limit', 'fields'];
    exculdeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStrings.sort) {
      const sortBy = this.queryStrings.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryStrings.fields) {
      const fields = this.queryStrings.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryStrings.page * 1 || 1;
    const limit = this.queryStrings.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
