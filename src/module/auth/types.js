const { schemaComposer } = require('graphql-compose')
const { composeWithMongoose } = require('graphql-compose-mongoose')

const UserModel = require('@app/module/auth/user')

const UserTC = composeWithMongoose(UserModel)
  .removeField('password')

const userAccountTC = UserTC.getFieldTC('account')

userAccountTC.getFieldTC('verification')
  .removeField(['token', 'expiresIn'])

userAccountTC.removeField('resetPassword')

schemaComposer.createObjectTC({
  name: 'AccessToken',
  fields: { accessToken: 'String!' }
})

UserTC.addFields({
  profileLevel: {
    type: 'Int'
  }
})

const userProfileInput = UserTC.getFieldTC('profile').getITC()
userProfileInput.removeField(['_id', 'updatedAt', 'createdAt', 'bloodType'])
userProfileInput.removeField(['level.phone.verified', 'level.cnic.verified', 'level.medicalReport.verified'])


schemaComposer.createEnumTC({
  name: 'Locale',
  values: {
    en: { value: 'en' },
    ge: { value: 'ge' }
  }
})

module.exports = UserTC
