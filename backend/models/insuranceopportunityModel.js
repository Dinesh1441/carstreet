import mongoose from "mongoose";

const insuranceOpportunitySchema = new mongoose.Schema({
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
        enum: ["Inspection", "Quotation", "Documentation", "Payment"],
    },
    currentInsuranceValidity: {
        type: String,
        required: true,
        enum: ["Date", "Expired"],
    },
    documentsStatus: [{
        type: String,
        enum: ["RC", "Aadhar", "Pan Card", "Photo", "Inspection Mandatory", "Expired Policy"],
    }],
    insurerName: {
        type: String,
    },
    costOfInsurance: {
        type: Number,
        min: 0,
    },
    insuranceTerm: {
        type: String,
        enum: ["1 Year", "2 Years", "3 Years", "4 Years", "5 Years"],
    },
    insuranceType: {
        type: String,
        enum: ["Comprehensive", "Third Party", "Zero Depreciation"],
    },
    insuranceExpiryDate: {
        type: Date,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true,
    }
}, { timestamps: true });

const InsuranceOpportunity = mongoose.models.InsuranceOpportunity || mongoose.model("InsuranceOpportunity", insuranceOpportunitySchema);

export default InsuranceOpportunity;