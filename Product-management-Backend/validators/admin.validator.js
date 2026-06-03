// validators/admin.validator.js
const validateAdminRegister = (req, res, next) => {
  const { mobile, email, domain, password, firstName, lastName, companyName, address } = req.body;
  const errors = [];

  if (!mobile) errors.push("Mobile number is required");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Please enter a valid email");
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain.toLowerCase())) errors.push("Please enter a valid domain");
  if (!password || password.length < 6) errors.push("Password must be at least 6 characters");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Sanitize inputs
  req.body.email = email.toLowerCase().trim();
  req.body.domain = domain.toLowerCase().trim();
  req.body.mobile = mobile.trim();
  if (firstName) req.body.firstName = firstName.trim();
  if (lastName) req.body.lastName = lastName.trim();
  if (companyName) req.body.companyName = companyName.trim();
  if (address) req.body.address = address.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, errors: ["Email and password are required"] });
  }
  req.body.email = email.toLowerCase().trim();
  next();
};

module.exports = { validateAdminRegister, validateLogin };