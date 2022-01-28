const bcrypt = require('bcryptjs')
const { BLOOD_GROUPS, PointSchema } = require('../../const')
const mongoose = require('@app/mongoose')
const { Mongoose } = require('mongoose')

const { Schema } = mongoose

const UserProfileSchema =
{
  profilePic: String,
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  bloodType: {...BLOOD_GROUPS, default: undefined},
  age: {
    type: Number
  },
  address: String,
  city: String,
  level: {
    phone: {
      number: String,
      verified: {
        type: Boolean,
        default:  false
      }
    },
    cnic: {
      imageUrl: String,
      verified: {
        type: Boolean,
        default:  false
      }
    },
    medicalReport: {
      medicalReportUrl: String,
      verified: {
        type: Boolean,
        default:  false
      }
    }
  },
  reason: {
    type: String,
    enum: ['donor', 'receiver'],
    default: 'donor'
  }
}



const userSchema = new Schema(
  {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    locale: String,
    profileLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    fcmID: String,
    profile: UserProfileSchema,
    account: {
      verification: {
        verified: {
          type: Boolean,
          default: false
        },
        token: String,
        expiresIn: Date
      },
      resetPassword: {
        token: String,
        expiresIn: Date
      }
    }
  },
  {
    timestamps: true,
  }
)

userSchema.statics.emailExist = function (email) {
  return this.findOne({ email })
}

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

// userSchema.virtual('profileLevel').get(function (value, virtual, doc) {
//   try {
//     let lev = 0
//     if (this.profile.level.phone.verified) lev++
//     if (this.profile.level.cnic.verified) lev++
//     if (this.profile.level.medicalReport.verified) lev++
//     return lev
//     // if (lev == 0) return 'Bronze'
//     // if (lev == 1) return 'Silver'
//     // if (lev == 2) return 'Gold'
//     // if (lev == 3) return 'Platinum'
//   } catch (e) {
//     return 0
//   }
// });


const User = mongoose.model('User', userSchema)

module.exports = User

