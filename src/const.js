const mongoose = require('mongoose')

const BLOOD_GROUPS = {
    type: String,
    enum: ["APos", 'ANeg', 'BPos', 'BNeg', 'OPos', 'ONeg', 'ABPos', 'ABNeg'],
    default: "APos"
}

const BLOOD_COMPONENT = {
    type: String,
    enum: ["plasma", "blood", 'platelets'],
    default: "blood"
}

const PointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

const BloodGroupsCriteria = [
    {
        "key": "APos",
        "donor": {
            "plasma": ["APos", "ANeg", "OPos", "ONeg"],
            "blood": [
                "APos",
                "ABPos"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ]
        },
        "receiver": {
            "plasma": [
                "APos",
                "ANeg",
                "ABPos",
                "ABNeg"
            ],
            "blood": [
                "APos",
                "ANeg",
                "OPos",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "ANeg",
        "donor": {
            "plasma": ["APos", "ANeg", "OPos", "ONeg"],
            "blood": [
                "ANeg",
                "APos",
                "ABNeg",
                "ABPos"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ]
        },
        "receiver": {
            "plasma": [
                "ABPos",
                "ABNeg",
                "APos",
                "ANeg",
            ],
            "blood": [
                "ANeg",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "BPos",
        "donor": {
            "plasma": ["BPos", "BNeg", "OPos", "ONeg"],
            "blood": [
                "BPos",
                "ABPos"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ]
        },
        "receiver": {
            "plasma": [
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg"
            ],
            "blood": [
                "BPos",
                "BNeg",
                "OPos",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "BNeg",
        "donor": {
            "plasma": ["BPos", "BNeg", "OPos", "ONeg"],
            "blood": [
                "BNeg",
                "BPos",
                "ABNeg",
                "ABPos"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ]
        },
        "receiver": {
            "plasma": [
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg"
            ],
            "blood": [
                "BNeg",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "OPos",
        "donor": {
            "plasma": ["OPos", "ONeg"],
            "blood": [
                "OPos",
                "APos",
                "BPos",
                "ABPos"
            ],
            "platelets": []
        },
        "receiver": {
            "plasma": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "blood": [
                "OPos",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "ONeg",
        "donor": {
            "plasma": ["OPos", "ONeg"],
            "blood": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        },
        "receiver": {
            "plasma": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "blood": [
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "ABPos",
        "donor": {
            "plasma": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "blood": [
                "ABPos"
            ],
            "platelets": []
        },
        "receiver": {
            "plasma": [
                "ABPos",
                "ABNeg"
            ],
            "blood": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    },
    {
        "key": "ABNeg",
        "donor": {
            "plasma": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg",
                "ABPos",
                "ABNeg",
                "OPos",
                "ONeg"
            ],
            "blood": [
                "ABNeg",
                "ABPos"
            ],
            "platelets": []
        },
        "receiver": {
            "plasma": [
                "ABPos",
                "ABNeg"
            ],
            "blood": [
                "ANeg",
                "BNeg",
                "ABNeg",
                "ONeg"
            ],
            "platelets": [
                "APos",
                "ANeg",
                "BPos",
                "BNeg"
            ]
        }
    }
]



module.exports = {
    BLOOD_GROUPS,
    PointSchema,
    BloodGroupsCriteria,
    BLOOD_COMPONENT
}
