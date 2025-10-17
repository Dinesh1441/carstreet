import CarVariant from "../models/variantModel.js";

// Create a new variant
export const createVariant = async (req, res) => {
    try {
        const { name, model } = req.body;
        if (!name || !model) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }
        const newVariant = new CarVariant({ name, model });
        await newVariant.save();    
        res.status(201).json({ status: 'success', variant: newVariant });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};
// Get all variants
export const getAllVariants = async (req, res) => {
    try {
        const variants = await CarVariant.find().populate('model');
        res.status(200).json({ status: 'success', variants });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};
// Update a variant by ID
export const updateVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, model } = req.body;
        const updatedVariant = await CarVariant.findByIdAndUpdate(id, { name, model }, { new: true });
        if (!updatedVariant) {
            return res.status(404).json({ status: 'error', message: 'Variant not found' });
        }
        res.status(200).json({ status: 'success', variant: updatedVariant });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }       
};
// Delete a variant by ID
export const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVariant = await CarVariant.findByIdAndDelete(id);
        if (!deletedVariant) {
            return res.status(404).json({ status: 'error', message: 'Variant not found' });
        }
        res.status(200).json({ status: 'success', message: 'Variant deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};


// Get variants by model ID
export const getVariantsByModelId = async (req, res) => {
    try {
        const { modelId } = req.params;
        
        if (!modelId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Model ID is required' 
            });
        }

        const variants = await CarVariant.find({ model: modelId }).populate('model');

        if (!variants || variants.length === 0) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No variants found for this model',
                variants: []
            });
        }

        res.status(200).json({ 
            status: 'success', 
            message: 'Variants fetched successfully',
            count: variants.length,
            variants 
        });
    } catch (error) {
        console.error('Error fetching variants by model ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Invalid model ID format' 
            });
        }

        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch variants', 
            error: error.message 
        });
    }
};

