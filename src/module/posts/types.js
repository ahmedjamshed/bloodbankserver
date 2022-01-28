const { schemaComposer } = require('graphql-compose')
const { composeWithMongoose } = require('graphql-compose-mongoose')

const PostModel = require('@app/module/posts/post')

const PostTC = composeWithMongoose(PostModel, {
    inputType: {
        fields: {
            remove: ["userID", "updatedAt", "createdAt"]
        }
    }
})

schemaComposer.createEnumTC({
    name: 'BloodGroup',
    values: {
        'APos' : {value: 'APos'},
        'ANeg' : {value: 'ANeg'},
        'BPos' : {value: 'BPos'},
        'BNeg' : {value: 'BNeg'},
        'OPos' : {value: 'OPos'},
        'ONeg' : {value: 'ONeg'},
        'ABPos' : {value: 'ABPos'},
        'ABNeg' : {value: 'ABNeg'},
    }
})

schemaComposer.createEnumTC({
    name: 'BLOOD_COMPONENT',
    values: {
        'blood' : {value: 'blood'},
        'plasma' : {value: 'plasma'},
        'platelets' : {value: 'platelets'},
    }
})

schemaComposer.createEnumTC({
    name: 'USER_TYPE',
    values: {
        'donor' : {value: 'donor'},
        'receiver' : {value: 'receiver'},
    }
})

schemaComposer.createInputTC({
    name: 'PostsFilter',
    fields: { 
        bloodType: 'BloodGroup',
        city: 'String',
        profileLevel: 'Int',
        bloodComponent: 'BLOOD_COMPONENT',
        userType: 'USER_TYPE'
    }
})

module.exports = PostTC