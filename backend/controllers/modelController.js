import CarModel from "../models/modelModel.js";

// Create a new model
export const createModel = async (req, res) => {
    try {
        const { name, make } = req.body;
        console.log('Request Body:', req.body);
        if (!name || !make) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }
        const newModel = new CarModel({ name, make });
        await newModel.save();
        res.status(201).json({ status: 'success', model: newModel });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};

// Get all models
export const getAllModels = async (req, res) => {
    try {
        const models = await CarModel.find().populate('make');
        res.status(200).json({ status: 'success', models });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};

// Update a model by ID
export const updateModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, make } = req.body;
        const updatedModel = await CarModel.findByIdAndUpdate (id, { name, make }, { new: true });
        if (!updatedModel) {
            return res.status(404).json({ status: 'error', message: 'Model not found' });
        }
        res.status(200).json({ status: 'success', model: updatedModel });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};
// Delete a model by ID
export const deleteModel = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedModel = await CarModel.findByIdAndDelete(id);
        if (!deletedModel) {
            return res.status(404).json({ status: 'error', message: 'Model not found' });
        }
        res.status(200).json({ status: 'success', message: 'Model deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};


// Get models by make ID
export const getModelsByMakeId = async (req, res) => {
    try {
        const { makeId } = req.params;
        
        if (!makeId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Make ID is required' 
            });
        }

        const models = await CarModel.find({ make: makeId }).populate('make');

        if (!models || models.length === 0) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'No models found for this make',
                models: []
            });
        }

        res.status(200).json({ 
            status: 'success', 
            message: 'Models fetched successfully',
            count: models.length,
            models 
        });
    } catch (error) {
        console.error('Error fetching models by make ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Invalid make ID format' 
            });
        }

        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch models', 
            error: error.message 
        });
    }
};

