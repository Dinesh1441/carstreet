import mongoose from "mongoose";

const rtoOpportunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["Open", "Won", "Lost"],
        default: "Open",
    },
    stage: {
        type: String,
        required: true,
        enum: ["Prospecting", "Qualification", "Need Analysis", "Proposal", "Negotiation"],
    },
    processToBeDone: {
        type: String,
        required: true,
        enum: [
            "RC Transfer to Same State",
            "RC Transfer to Other State",
            "Normal care-of Transfer",
            "Hypothecation Add-On",
            "Transfer to other State with Owner Change",
            "No Transfer"
        ],
    },
    transferType: {
        type: String,
        enum: ["Individual", "Company"],
    },
    documentsPending: [{
        type: String,
        enum: ["RC", "Aadhar", "Pan Card", "Photo", "Insurance", "Pollution Certificate", "Sale Deed", "NOC"],
    }],
    rtoStatus: {
        type: String,
        enum: ["Documentation", "File Sent to RTO", "In-Progress", "Completed"],
    },
    expectedDateOfTransfer: {
        type: Date,
    },
    newRegNumber: {
        type: String,
    },
    newRcCardStatus: {
        type: String,
        enum: ["Received", "Pending"],
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true,
    }
}, { timestamps: true });

const RtoOpportunity = mongoose.models.RtoOpportunity || mongoose.model("RtoOpportunity", rtoOpportunitySchema);

export default RtoOpportunity;