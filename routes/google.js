const express = require('express')
const router = express.Router()
const passport = require('passport')
const {updateUserByHandle} = require('../io/database/users')
const config = require('../config/config').readConfig()

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

router.get('/auth',
           passport.authenticate('google', {scope: config.google.scopes,
                                            accessType: 'offline',
                                            approvalPrompt: 'force'}))

router.get('/auth/callback',
  passport.authenticate('google', {failureRedirect: '/google/auth'}),
  (request, response) => {
    request.session.access_token = request.user.accessToken
    request.session.google_refresh_token = request.user.refreshToken
    // TODO: maybe we dont need this, as the user is not created when this is
    // run the first time
    updateUserByHandle(request.idmUser.handle,
                       {google_token: request.user.accessToken,
                        google_refresh_token: request.user.refreshToken})
     .then(() => {
       const redirectTo = request.session.redirectTo || '/'
       delete request.session.redirectTo;
       response.redirect(redirectTo)
     })
  })

module.exports = router
