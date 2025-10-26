    import mongoose from "mongoose";

    const buyopportunitySchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car",
        },
        phoneNumber: {
            type: String,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        source: {
            type: String,
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
            enum: ["Fresh Lead", "Lead", "Negotiation", "Test Drive", "Showroom Visit"],
        },
        year: {
            type: Number,
        },
        minBudget: {
            type: Number,
        },
        maxBudget: {
            type: Number,
        },
        make: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "makeModel",
            required: true,
        },
        model: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CarModel",
            required: true,
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CarVariant",
        },
        colour: {
            type: String,
        },
        carStatus: {
            type: String,
        },
        carAvailabilityStatus: {
            type: String,
            enum: ["Available", "Not Available", ""],
            default: "",
        },
        carId: {
            type: String,
        },
        buyingIntent: {
            type: String,
            enum: ["Within 15 days", "Within 30 days", "Within 2-3 Months", ""],
            default: "",
        },
        finance: {
            type: String,
            required: true,
            enum: ["Yes", "No", "Maybe"],
        },
        financeAmount: {
            type: Number,
        },
        rto: {
            type: String,
            required: true,
            enum: ["Yes", "No", "Maybe"],
        },
        rtoTransferName: {
            type: String,
        },
        rtoChoiceNumber: {
            type: String,
        },
        rtoProcessToBeDone: {
            type: String,
            enum: [
                "RC Transfer to Other State",
                "Normal care-of Transfer",
                "Hypothecation Add-On",
                "Hypothecation Remove",
                "Transfer to other State with Owner Change",
                "No Transfer",
                ""
            ],
            default: "",
        },
        rtoRequiredState: {
            type: String,
        },
        rtoProcess: {
            type: String,
            enum: ["Process 1", "Process 2", "No Process", ""],
            default: "",
        },
        insurance: {
            type: String,
            required: true,
            enum: ["Yes", "No"],
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

    const BuyOpportunity = mongoose.models.BuyOpportunity || mongoose.model("BuyOpportunity", buyopportunitySchema);

    export default BuyOpportunity;