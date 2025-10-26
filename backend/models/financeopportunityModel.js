import mongoose from "mongoose";

const financeOpportunitySchema = new mongoose.Schema({
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
        enum: ["Document Pending", "Under Process/Application", "Loan Approved"],
    },
    loanAmount: {
        type: Number,
        required: true,
    },
    documentsPending: {
        type: String,
    },
    loanType: {
        type: String,
        required: true,
        enum: [
            "Individual",
            "Company", 
            "Salaried Persons",
            "Limited Company",
            "Private Limited Company",
            "Limited Liability Partnership",
            "Partnership",
            "Society/Trust"
        ],
    },
    financeStatus: {
        type: String,
        required: true,
        enum: [
            "Documents Pending",
            "Under Process/Application",
            "Loan Approved",
            "Loan Rejected",
            "Loan Disbursed"
        ],
    },
    banksAppliedTo: [{
        type: String,
        enum: [
            "ICICI Bank",
            "Axis Bank",
            "Kotak Bank",
            "IDFC Bank",
            "Bajaj Finserv",
            "Yes Bank",
            "AU Bank",
            "HDFC Bank",
            "Other"
        ],
    }],
    approvedBank: {
        type: String,
        enum: [
            "ICICI Bank",
            "Axis Bank",
            "Kotak Bank",
            "IDFC Bank",
            "Bajaj Finserv",
            "Yes Bank",
            "AU Bank",
            "HDFC Bank",
            "Other"
        ],
    },
    rateOfInterest: {
        type: Number,
        min: 0,
        max: 30,
    },
    periodOfRepayment: {
        type: String,
        enum: [
            "1 Year",
            "2 Years",
            "3 Years",
            "4 Years",
            "5 Years",
            "6 Years",
            "7 Years"
        ],
    },
    loanNumber: {
        type: String,
    },
    loanSanctioned: {
        type: Boolean,
        default: false,
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
        required: true,
    },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    
}, { timestamps: true });

const FinanceOpportunity = mongoose.models.FinanceOpportunity || mongoose.model("FinanceOpportunity", financeOpportunitySchema);

export default FinanceOpportunity;