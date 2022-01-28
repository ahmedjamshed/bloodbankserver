const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-random-string')
const moment = require('moment')

const redis = require('@app/redis')
const {
  verifyRequestMail,
  verifyMail,
  resetPasswordMail
} = require('@app/module/auth/mail')
const { verifyRequestService } = require('@app/module/auth/service')
const UserModel = require('@app/module/auth/user')
const UserTC = require("./types")

const user = {
  name: 'user',
  type: 'User!',
  resolve: ({ context: { user } }) => user
}

const signIn = {
  name: 'signIn',
  type: 'AccessToken!',
  args: {
    email: 'String!',
    password: 'String!',
    fcmID: 'String!'
  },
  resolve: async ({ args: { email, password, fcmID } }) => {
    try {
      const user = await UserModel.emailExist(email)
      if (!user) {
        return Promise.reject(new Error('User not found.'))
      }

      const comparePassword = await user.comparePassword(password)
      if (!comparePassword) {
        return Promise.reject(new Error('Password is incorrect.'))
      }


      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )
      user.set({fcmID})
      await  user.save()
      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const signUp = {
  name: 'signUp',
  type: 'AccessToken!',
  args: {
    email: 'String!',
    password: 'String!',
    firstName: 'String!',
    lastName: 'String!',
    fcmID: 'String!'
  },
  resolve: async ({ args: { email, password, firstName, lastName, fcmID }, context: { i18n } }) => {
    try {
      let user = await UserModel.emailExist(email)
      if (user) {
        return Promise.reject(new Error('Email has already been taken.'))
      }

      const hash = bcrypt.hashSync(password, 10)

      user = await new UserModel({
        email,
        password: hash,
        locale: i18n.language,
        firstName,
        lastName,
        fcmID
      }).save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      const token = await verifyRequestService(user)

      verifyRequestMail(user, token)

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const logout = {
  name: 'logout',
  type: 'Succeed!',
  resolve: async ({ context: { user, accessToken } }) => {
    try {
      // await redis.set(
      //   `expiredToken:${accessToken}`,
      //   user._id,
      //   'EX',
      //   process.env.REDIS_TOKEN_EXPIRY
      // )
      user.set({fcmID: ""})
      await user.save()
      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const verifyRequest = {
  name: 'verifyRequest',
  type: 'Succeed!',
  resolve: async ({ context: { user } }) => {
    try {
      const token = await verifyRequestService(user)

      verifyRequestMail(user, token)

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const verify = {
  name: 'verify',
  type: 'AccessToken!',
  args: { token: 'String!' },
  resolve: async ({ args: { token } }) => {
    try {
      const user = await UserModel.findOne({
        'account.verification.token': token
      })
      if (!user) {
        return Promise.reject(
          new Error('Access Token is not valid or has expired.')
        )
      }

      user.set({
        account: {
          verification: {
            verified: true,
            token: null,
            expiresIn: null
          }
        }
      })

      await user.save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      verifyMail(user)

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const resetPassword = {
  name: 'resetPassword',
  type: 'Succeed!',
  args: { email: 'String!' },
  resolve: async ({ args: { email } }) => {
    try {
      const user = await UserModel.findOne({ email })
      if (!user) {
        return Promise.reject(new Error('User not found.'))
      }

      const token = crypto({ length: 48, type: 'url-safe' })
      const expiresIn = moment().add(7, 'days')

      user.set({
        account: {
          resetPassword: {
            token,
            expiresIn
          }
        }
      })

      await user.save()

      resetPasswordMail(user, token)

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const newPassword = {
  name: 'newPassword',
  type: 'AccessToken!',
  args: { token: 'String!', newPassword: 'String!' },
  resolve: async ({ args: { token, newPassword } }) => {
    try {
      const user = await UserModel.findOne({
        'account.resetPassword.token': token
      })
      if (!user) {
        return Promise.reject(
          new Error('Access Token is not valid or has expired.')
        )
      }

      const hash = bcrypt.hashSync(newPassword, 10)

      user.set({
        password: hash,
        account: {
          resetPassword: {
            token: null,
            expiresIn: null
          }
        }
      })

      await user.save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const changePassword = {
  name: 'changePassword',
  type: 'Succeed!',
  args: { currentPassword: 'String!', newPassword: 'String!' },
  resolve: async ({
    args: { currentPassword, newPassword },
    context: { user }
  }) => {
    try {
      const comparePassword = await user.comparePassword(currentPassword)
      if (!comparePassword) {
        return Promise.reject(new Error('Current password is incorrect.'))
      }

      const hash = bcrypt.hashSync(newPassword, 10)

      user.set({ password: hash })

      await user.save()

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const updateUser = {
  name: 'updateUser',
  type: 'User!',
  args: { email: 'String!', firstName: 'String!', lastName: 'String!' },
  resolve: async ({ args: { email, firstName, lastName }, context: { user } }) => {
    try {
      let { account: { verification: { verified } } } = user,
        verifyRequest = false

      if (user.email !== email) {
        const userExist = await UserModel.findOne({ email })
        if (userExist) {
          return Promise.reject(new Error('Email has already been taken.'))
        }
        verified = false
        verifyRequest = true
      }

      user.set({
        email,
        firstName,
        lastName,
        account: {
          verification: {
            verified
          }
        }
      })

      await user.save()

      if (verifyRequest) {
        const token = await verifyRequestService(user)

        verifyRequestMail(user, token)
      }

      return user
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const updateVerification = {
  name: 'updateVerification',
  type: () => 'User!',
  args: {
    userID: 'ID!',
    phoneVerification: 'Boolean!',
    cnicVerification: 'Boolean!',
    medicalReportVerification: 'Boolean!',
    bloodType: 'BloodGroup!'
  },
  resolve: async ({ args: { userID, phoneVerification, cnicVerification, medicalReportVerification, bloodType }, context: { admin } }) => {
    try {

      const userExist = await UserModel.findOne({ _id: userID })

      let phone, cnic, medicalReport = null
      let profileLevel = 0

      try {
        phone = userExist.profile.level.phone
        if (phone.number && phoneVerification) {
          userExist.set({
            profile: {
              level: {
                phone: {
                  verified: true
                }
              }
            }
          })
        }
        if (userExist.profile.level.phone.number && userExist.profile.level.phone.verified) {
          profileLevel++
          userExist.set({
            profileLevel
          })
        }
      } catch (error) {
        console.log(error)
      }

      try {
        cnic = userExist.profile.level.cnic
        if (cnic.imageUrl && cnicVerification) {
          userExist.set({
            profile: {
              level: {
                cnic: {
                  verified: true
                }
              }
            }
          })
        }
        if (userExist.profile.level.cnic.imageUrl && userExist.profile.level.cnic.verified) {
          profileLevel++
          userExist.set({
            profileLevel
          })
        }

      } catch (error) {
        console.log(error)
      }

      try {
        medicalReport = userExist.profile.level.medicalReport
        if (medicalReport.medicalReportUrl && medicalReportVerification && bloodType) {
          userExist.set({
            profile: {
              bloodType,
              level: {
                medicalReport: {
                  verified: true
                }
              }
            }
          })
        }
        if (userExist.profile.level.medicalReport.medicalReportUrl && userExist.profile.level.medicalReport.verified) {
          profileLevel++
          userExist.set({
            profileLevel
          })
        }

      } catch (error) {
        console.log(error)
      }

      return await userExist.save()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}



const updateUserProfile = {
  name: 'updateUserProfile',
  type: () => 'User!',
  args: {
    input: 'UserProfileInput'
  }, //User profie
  resolve: async ({ args: { input }, context: { user } }) => {
    try {
      // let {_id } = user 
      // const userExist = await UserModel.findOne({ _id })
      let profileLevel = 0
      let vPhone = vCnic = vMedRep = true
      if (input.level) {

        try {
          if (input.level.phone.number && user.profile.level.phone
            && user.profile.level.phone.number != input.level.phone.number) {
            input.level.phone.verified = false
            vPhone = false
          }
        } catch (e) {
          console.log(e)
        }

        try {
          if (input.level.cnic.imageUrl && user.profile.level.cnic
            && user.profile.level.cnic.imageUrl != input.level.cnic.imageUrl) {
            input.level.cnic.verified = false
            vCnic = false
          }
        } catch (e) {
          console.log(e)
        }

        try {
          if (input.level.medicalReport.medicalReportUrl && user.profile.level.medicalReport
            && user.profile.level.medicalReport.medicalReportUrl != input.level.medicalReport.medicalReportUrl) {
            input.level.phone.verified = false
            vMedRep = false
          }
        } catch (e) {
          console.log(e)
        }

   

      }
    
      if (user.profile.level.phone.verified && vPhone) {
        profileLevel++
      }
      if (user.profile.level.cnic.verified && vCnic) {
        profileLevel++
      }
      if (user.profile.level.medicalReport.verified && vMedRep) {
        profileLevel++
      }

      user.set({
        profileLevel,
        profile: {
          ...input
        }
      })

      const savedUser = await user.save()

      return savedUser
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const unverfiedUsers = {
  name: 'unverfiedUsers',
  type: () => [UserTC],
  args: {
    limit: {
      type: 'Int',
      defaultValue: 10,
    },
    skip: 'Int',
    filter: () => 'PostsFilter',
  }, //User profie
  resolve: async ({ args, context: { admin } }) => {
    try {

      return await UserModel.find({
        $or:
          [
            {
              $and: [{ 'profile.level.phone.verified': { $eq: false } },
              { 'profile.level.phone.number': { "$nin": [null, ""] } }]
            },
            {
              $and: [{ 'profile.level.cnic.verified': { $eq: false } },
              { 'profile.level.cnic.imageUrl': { "$nin": [null, ""] } }]
            },
            {
              $and: [{ 'profile.level.medicalReport.verified': { $eq: false } },
               {'profile.level.medicalReport.medicalReportUrl': { "$nin": [null, ""] }}]
            }
          ]
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const switchLocale = {
  name: 'switchLocale',
  type: 'User!',
  args: { locale: 'Locale!' },
  resolve: async ({ args: { locale }, context: { user } }) => {
    try {
      user.set({ locale })

      await user.save()

      return user
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = {
  user,
  signIn,
  signUp,
  logout,
  verifyRequest,
  verify,
  resetPassword,
  newPassword,
  changePassword,
  updateUser,
  switchLocale,
  updateUserProfile,
  updateVerification,
  unverfiedUsers
}
