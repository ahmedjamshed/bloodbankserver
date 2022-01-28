const { schemaComposer } = require('graphql-compose')

require('@app/graphql/types')

const { isAuth, isGuest, isUnverfied /* isVerified */ } = require('@app/middleware')
const {
  signInValidator,
  signUpValidator,
  resetPasswordValidator,
  newPasswordValidator,
  changePasswordValidator,
  updateUserValidator
} = require('@app/validator')
const { UserTC, PostTC } = require('@app/module')

schemaComposer.Query.addFields({
  user: UserTC.getResolver('user', [isAuth]),
  users: UserTC.getResolver('findMany'),
  unverfiedUsers: UserTC.getResolver('unverfiedUsers') 
})

schemaComposer.Query.addFields({
  posts: PostTC.getResolver('findMany', [isAuth]),
  matchedPosts: PostTC.getResolver('matchedPosts', [isAuth])
})

schemaComposer.Mutation.addFields({ 
  createPost: PostTC.getResolver('createOne', [isAuth])
})

schemaComposer.Mutation.addFields({
  signIn: UserTC.getResolver('signIn', [isGuest, signInValidator]),
  signUp: UserTC.getResolver('signUp', [isGuest, signUpValidator]),
  logout: UserTC.getResolver('logout', [isAuth]),
  //verifyRequest: UserTC.getResolver('verifyRequest', [isAuth, isUnverfied]),
  //verify: UserTC.getResolver('verify'),
  // resetPassword: UserTC.getResolver('resetPassword', [isGuest, resetPasswordValidator]),
  // newPassword: UserTC.getResolver('newPassword', [
  //   isGuest,
  //   newPasswordValidator
  // ]),
  changePassword: UserTC.getResolver('changePassword', [
    isAuth,
    changePasswordValidator
  ]),
  // updateUser: UserTC.getResolver('updateUser', [isAuth, updateUserValidator]),
  updateUserProfile: UserTC.getResolver('updateUserProfile', [isAuth]),
  updateVerification: UserTC.getResolver('updateVerification'),
  //switchLocale: UserTC.getResolver('switchLocale', [isAuth])
})

const schema = schemaComposer.buildSchema()


module.exports = schema
