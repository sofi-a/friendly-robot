const {
  model,
  Schema,
  Types: { ObjectId },
} = require('mongoose');

const {
  models: { EMAIL, USER },
} = require('../utils/constants');

const EmailSchema = new Schema(
  {
    emailId: { type: String },
    threadId: { type: String },
    labels: [{ type: String }],
    historyId: { type: String },
    internalDate: { type: String },
    deliveredTo: { type: String },
    sender: { type: String },
    to: { type: String },
    from: { type: String },
    messageId: { type: String },
    subject: { type: String },
    date: { type: String },
    snippet: { type: String },
    body: { type: String },
    user: { type: ObjectId, ref: USER },
  },
  { timestamps: true }
);

const Email = model(EMAIL, EmailSchema);

module.exports = Email;
