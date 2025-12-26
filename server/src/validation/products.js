const allowed = new Set(["dry", "oily", "combination", "sensitive", "normal"]);

export function validateSkinTypeQuery(req, _res, next) {
  const skinType = String(req.query?.skinType || "").toLowerCase();
  if (!allowed.has(skinType)) {
    const err = new Error("skinType must be one of: dry, oily, combination, sensitive, normal");
    err.statusCode = 400;
    return next(err);
  }
  req.query.skinType = skinType;
  next();
}

