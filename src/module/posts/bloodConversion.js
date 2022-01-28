 const convertBlood = (blood) => {
  switch (blood) {
    case "A+":
      return "APos";

    case "A-":
      return "ANeg";

    case "AB+":
      return "ABPos";

    case "AB-":
      return "ABNeg";

    case "B+":
      return "BPos";

    case "B-":
      return "BNeg";

    case "O+":
      return "OPos";

    case "O-":
      return "ONeg";

    case "APos":
      return "A+";

    case "ANeg":
      return "A-";

    case "ABPos":
      return "AB+";
 
    case "ABNeg":
      return "AB-";

    case "BPos":
      return "B+";

    case "BNeg":
      return "B-";
   
    case "OPos":
      return "O+";

    case "ONeg":
      return "O-";

    default:
      return "";
  }
};
module.exports = convertBlood