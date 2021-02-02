const { modelNames } = require("mongoose");

module.exports = {
    eAdmin: function( req, res, next ) {
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Somente um admin pode acessar a pagina!")
        res.redirect("/")

    }
}