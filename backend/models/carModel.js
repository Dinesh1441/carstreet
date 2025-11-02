import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
    // Basic Information
    brand: { type: mongoose.Schema.Types.ObjectId , ref : 'makeModel', required: true },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'CarModel', required: true },
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'CarVariant', required: true, default: null },
    color: { type: String, required: true },
    carType: { type: String, required: true },
    
    // Year Information
    manufacturingYear: { type: String, required: true },
    registrationYear: { type: String, required: true },
    
    // Ownership & Usage
    numberOfOwners: { type: String, required: true },
    kilometersDriven: { type: String, required: true },
    
    // Technical Specifications
    fuelType: { type: String, required: true },
    
    // Registration Details
    registrationState: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    
    // Insurance Information
    insuranceValidity: { type: String, required: true },
    insuranceType: { type: String, required: true },
    
    // Warranty
    warrantyValidity: { type: String, required: true },
    
    // Status
    status: { type: String, required: true },
    
    // Media & Documents
    photos: [{ type: String }], // Array of image URLs
    documents: [{ type: String }], // Array of document URLs
    
    // Pricing
    askingPrice: { type: Number, required: true },
}, { timestamps: true });

const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

export default Car;