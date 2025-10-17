import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StateModel",
        required: true,
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for efficient queries


// Virtual for city display name
CitySchema.virtual('displayName').get(function() {
    return `${this.name}`;
});

const City = mongoose.models.City || mongoose.model("City", CitySchema);

export default City;