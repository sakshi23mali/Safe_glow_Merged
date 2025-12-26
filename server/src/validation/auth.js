function isEmail(value) {
  return typeof value === "string" && /\S+@\S+\.\S+/.test(value);
}

function validatePasswordStrength(password) {
  if (typeof password !== "string" || password.length < 1) return "Password is required";
  return null;
}

export function validateRegisterBody(req, _res, next) {
  const { username, name, email, password } = req.body || {};

  if (typeof username !== "string" || username.trim().length < 3) {
    const err = new Error("Username must be at least 3 characters");
    err.statusCode = 400;
    return next(err);
  }

  if (typeof name !== "undefined" && (typeof name !== "string" || !name.trim())) {
    const err = new Error("Name must be a non-empty string");
    err.statusCode = 400;
    return next(err);
  }

  if (!isEmail(email)) {
    const err = new Error("Valid email is required");
    err.statusCode = 400;
    return next(err);
  }

  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    const err = new Error(passwordError);
    err.statusCode = 400;
    return next(err);
  }

  next();
}

export function validateLoginBody(req, _res, next) {
  const { email, password } = req.body || {};

  if (!isEmail(email)) {
    const err = new Error("Valid email is required");
    err.statusCode = 400;
    return next(err);
  }

  if (typeof password !== "string" || password.length < 1) {
    const err = new Error("Password is required");
    err.statusCode = 400;
    return next(err);
  }

  next();
}

export function validateExistsQuery(req, _res, next) {
  const email = req.query?.email;
  const username = req.query?.username;

  if (!email && !username) {
    const err = new Error("email or username is required");
    err.statusCode = 400;
    return next(err);
  }

  if (email && !isEmail(email)) {
    const err = new Error("Valid email is required");
    err.statusCode = 400;
    return next(err);
  }

  if (username && (typeof username !== "string" || username.trim().length < 1)) {
    const err = new Error("Valid username is required");
    err.statusCode = 400;
    return next(err);
  }

  next();
}
