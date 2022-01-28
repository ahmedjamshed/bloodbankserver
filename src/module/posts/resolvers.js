const PostTC = require("./types")
const PostModel = require("./post")
const { BloodGroupsCriteria } = require('../../const')

const matchedPosts = {
    name: 'matchedPosts',
    type: () => [PostTC], // array of Posts
    args: {
        limit: {
            type: 'Int',
            defaultValue: 10,
        },
        skip: 'Int',
        filter: () => 'PostsFilter',
    },
    resolve: async ({ args: { filter, limit, skip }, context: { user } }) => {
        try {
            const criteria = [];

            if (filter) {
                const reason = (user.profile.reason || 'receiver')
                if (filter.bloodType) {
                    const BTypes = BloodGroupsCriteria.find(it =>
                        it.key == filter.bloodType)[reason][filter.bloodComponent || 'blood']
                    criteria.push({
                        $match: {
                            $and: [
                                { bloodType: { $in: BTypes } },
                                { componentType: filter.bloodComponent || 'blood' },
                            ]
                        }
                    })
                }
                if (filter.city) criteria.push({ $match: { city: { $eq: filter.city } } });
                // if (filter.bloodType) criteria.bloodType = { $in: [filter.bloodType] };
                // if (filter.city) criteria.city = { $eq: filter.city };
                 criteria.push(
                    //{ $unwind: "$userID" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "user"

                        }
                    },
                    {
                        $addFields: {
                            user: { $arrayElemAt: ["$user", 0] }
                        }
                    },
                    {
                        $match: {
                            $and: [
                                { "user.profileLevel": {$gte: filter.profileLevel || 1} },
                                { "user.profile.reason": reason === "donor"? "receiver": "donor" },
                                { "user._id": { $ne: user._id } }
                            ]

                        }
                    }
                )
            }
            const posts = await PostModel
                .aggregate(criteria)
                //.lean()
                .limit(limit)
                .skip(skip || 0)
            return posts

        } catch (error) {
            return Promise.reject(error)
        }
    }
}


module.exports = { matchedPosts }
