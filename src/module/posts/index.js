const PostTC = require("@app/module/posts/types");
const resolvers = require("@app/module/posts/resolvers");
const UserTC = require("@app/module/auth/types");
const { BloodGroupsCriteria } = require("../../const");
const { sendNotification } = require("../auth/notifications");
const convertBlood = require("./bloodConversion");

for (const resolver in resolvers) {
  PostTC.addResolver(resolvers[resolver]);
}

PostTC.addRelation("user", {
  resolver: () => UserTC.getResolver("findById"),
  prepareArgs: {
    _id: (source) => source.userID,
  },
  projection: { userID: false },
});

PostTC.wrapResolverResolve("createOne", (next) => async (rp) => {
  rp.beforeRecordMutate = async (doc, rp) => {
    doc.userID = rp.context.user._id;
    const userType = rp.context.user.profile.reason;
    const bloodComp = doc.componentType || "blood";
    const bloodType = doc.bloodType;
    const city = doc.city;
    const BTypes =
      BloodGroupsCriteria.find((it) => it.key == bloodType)[userType][
        bloodComp
      ] || [];

    let message = {};
    const blood = convertBlood(bloodType);
    if (userType === "donor") {
      message = {
        notification: {
          title: blood,
          body: `${rp.context.user.firstName} ${rp.context.user.lastName} is willing to donate ${blood} ${bloodComp} in ${city}. You can receive this ${blood} ${bloodComp} as your blood matches.`,
        },
        data: {
          userName: `${rp.context.user.firstName} ${rp.context.user.lastName}`,
          id: rp.context.user._id.toString(),
          phone: rp.context.user.profile.level.phone.number,
        },
      };
    } else {
      message = {
        notification: {
          title: blood,
          body: `${rp.context.user.firstName} ${rp.context.user.lastName} needs ${blood} ${bloodComp} in ${city}. Your blood matches for donation.`,
        },
        data: {
          userName: `${rp.context.user.firstName} ${rp.context.user.lastName}`,
          id: rp.context.user._id.toString(),
          phone: rp.context.user.profile.level.phone.number,
        },
      };
    }

    BTypes.map((val) => {
      sendNotification(
        userType === "donor"
          ? "receiver" + "_" + val + "_" + bloodComp
          : "donor" + "_" + val + "_" + bloodComp,
        message
      );
    });

    return doc;
  };

  return next(rp);
});

module.exports = PostTC;
