const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const config = require('./configuration');
const User = require('./models/user');
const GooglePlusTokenStrategy = require('passport-google-plus-token')
const FacebookTokenStrategy = require('passport-facebook-token')
const dotenv = require('dotenv').config();

// JSON WEB TOKENS STRATEGY
passport.use('local', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.JWT_SECRET_ENV
}, async (payload, done) => {
  try {
    // Find the user specified in token
    const user = await User.findById(payload.sub);

    // If user doesn't exists, handle it
    if (!user) {
      return done(null, false);
    }

    // Otherwise, return the user
    done(null, user);
  } catch(error) {
    done(error, false);
  }
}));

// FACEBOOK Strategy
passport.use('facebook-token', new FacebookTokenStrategy({
  clientID: config.oauth.facebook.clientID,
  clientSecret: config.oauth.facebook.clientSecret
}, async (acccessToken, refreshToken, profile, done) => {

  try{

    const existingUser = await User.findOne({'facebook.id': profile.id})
    if(existingUser){
      console.log('user already exists in DB');
      return done(null, existingUser)
    }
    const newUser = new User({
      method: 'google',
      facebook: {
        id: profile.id,
        email: profile.emails[0].value
      }
    })
    await newUser.save()
    done(null, newUser)

  }catch(error){
    done(error, false, error.message)
  }
}))

// GOOGLE Strategy
passport.use('google-token', new GooglePlusTokenStrategy({
  clientID: config.oauth.google.clientID,
  clientSecret: config.oauth.google.clientSecret
}, async (acccessToken, refreshToken, profile, done) =>{
  // console.log(acccessToken);
  // console.log(refreshToken);
  // console.log(profile);

  // check if current user exists in db
  const existingUser = await User.findOne({'google.id': profile.id})
  if(existingUser){
    console.log('user already exists in DB');
    return done(null, existingUser)
  }

  console.log('user does not exists, but we\'ll create it!');
  // if new account
  const newUser = new User({
    method: 'google',
    google: {
      id: profile.id,
      email: profile.emails[0].value
    }
  })
  try{
    await newUser.save()
    done(null, newUser);
  }catch(error){
    done(error, error.message)
  }

}))

//LOCAL Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',

}, async (email, password, done) => {
  try {

    // Find the user specified in token
    const user = await User.findOne({ 'local.email' :email });

    // If user doesn't exists, handle it
    if (!user) {
      return done(null, false);
    }
    const isMatch = await user.isValidPassWord(password)

    // No Matching Password?
    if(!isMatch){
      return done(null, false)
    }

    done(null, user)

  }catch(error){
    done(error, false)
  }
}));
