import { stat } from 'fs';
import makeModel from '../models/makeModel.js';

// Create a new make
export const createMake = async (req, res) => {
    try {
        const { make } = req.body;
        const newMake = new makeModel({ make });
        await newMake.save();
        res.status(201).json({ status: 'success', make: newMake });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};

// Get all makes
export const getAllMakes = async (req, res) => {
    try {
        const makes = await makeModel.find();
        res.status(200).json({ status: 'success', makes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};

// Update a make by ID
export const updateMake = async (req, res) => {
    try {
        const { id } = req.params;
        const { make } = req.body;
        const updatedMake = await makeModel.findByIdAndUpdate(id, { make }, { new: true });
        if (!updatedMake) {
            return res.status(404).json({ status: 'error', message: 'Make not found' });
        }
        res.status(200).json({ status: 'success', make: updatedMake });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};

// Delete a Make with by id 

export const deleteMake = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMake = await makeModel.findByIdAndDelete(id);
        if (!deletedMake) {
            return res.status(404).json({ status: 'error', message: 'Make not found' });
        }
        res.status(200).json({ status: 'success', message: 'Make deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Server Error', error });
    }
};


