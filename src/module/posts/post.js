const mongoose = require('@app/mongoose')
const { BLOOD_GROUPS, PointSchema , BLOOD_COMPONENT} = require('../../const')

const { Schema } = mongoose

const PostSchema = new Schema(
    {
        name: String,
        age: Number,
        disease: String,
        bloodType: BLOOD_GROUPS,
        componentType: BLOOD_COMPONENT,
        address: PointSchema,
        hospital: PointSchema,
        city: String,
        userID: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
)


const Post = mongoose.model('Post', PostSchema)

module.exports = Post
