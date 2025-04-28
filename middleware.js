function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "You must be logged in to view this listing.");
    res.redirect("/login");
  }
  
  module.exports = { isLoggedIn };