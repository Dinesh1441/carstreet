import StateModel from "../models/stateModel.js";

export const createState = async (req, res) => {
    try {
        const { name } = req.body;
        const newState = new StateModel({ name });
        await newState.save();
        res.status(201).json({ status: "success", state: newState });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error", error });
    }
}

export const getAllStates = async (req, res) => {
    try {
        const states = await StateModel.find();
        res.status(200).json({ status: "success", states });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error", error });
    }
}

export const getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await StateModel.findById(id);
        if (!state) {
            return res.status(404).json({ status: "error", message: "State not found" });
        }
        res.status(200).json({ status: "success", state });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error", error });
    }
}

export const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedState = await StateModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedState) {
            return res.status(404).json({ status: "error", message: "State not found" });
        }
        res.status(200).json({ status: "success", state: updatedState });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error", error });
    }
}

export const deleteState = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedState = await StateModel.findByIdAndDelete(id);
        if (!deletedState) {
            return res.status(404).json({ status: "error", message: "State not found" });
        }
        res.status(200).json({ status: "success", message: "State deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server Error", error });
    }
}
