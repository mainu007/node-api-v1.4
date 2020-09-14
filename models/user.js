const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

//user schema
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      trim: true,
      required: true,
   },
   email: {
      type: String,
      trim: true,
      required: true,
   },
   dashed_password: {
      type: String,
      required: true,
   },
   salt: String,
   created: {
      type: Date,
      default: Date.now,
   },
   updated: Date,
});

//virtual field
userSchema
   .virtual("password")
   .set(function (password) {
      console.log("USERSC SET PASS: ", password);
      //temporary variable
      this._password = password;
      //salt string
      this.salt = uuidv4();
      //encryptPassword
      this.dashed_password = this.encryptPassword(password);
   })
   .get(function () {
      console.log("USERSC GET THIS._PASS: ", this._password);
      return this._password;
   });

//userSchema methods
userSchema.methods = {
   encryptPassword: function (password) {
      if (!password) {
         return "";
      }
      try {
         return crypto
            .createHmac("sha1", this.salt)
            .update(password)
            .digest("hex");
      } catch (err) {
         return "";
      }
   },
};

//exports user schema
module.exports = mongoose.model("User", userSchema);
