const mongoose = 
  require('mongoose')

const bcrypt =
  require('bcryptjs')

const Schema = 
  mongoose.Schema

const shortId = 
  require('shortId')


const UserSchema = new Schema({
  method: {
    type: String,
    enum: [
      'local', 
      'google', 
      'facebook'
    ],
    required: true
  },
  shortId: {
    type: String, 
    // unique: true, 
    default: shortId.generate()
  },
  username:{
    type: String,
    required: true
  },
  google:{
    id:{
      type: String,
    },
    email:{
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id:{
      type: String,
    },
    email:{
      type: String,
      lowercase: true
    },
    accessToken:{
      type: String,
    }
  },
  firstName: {
    type: String,
    lowercase: true
  },
  lastName: {
    type: String,
    lowercase: true
  },
  email: {
    type: String,
    lowercase: true
  },
  password: {
    type: String
  }
})

UserSchema.pre('save', async function(next) {
  if(this.method !== 'local'){
    next()
  }
  try {
    const salt = await 
      bcrypt.genSalt(10)
    const hash = await 
      bcrypt
        .hash(
          this.password, 
          salt
        )

    this.password = hash

    next()
  } catch(error) {
    next(error)
  }
})

UserSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt
      .compare(
        newPassword, 
        this.password
      )
  } catch(error) {
    throw new Error(error);
  }
}

const User = mongoose
  .model(
    'user', 
    UserSchema
  )

module.exports = User
