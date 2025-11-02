import Note from '../models/noteModel.js';
import Activity from '../models/activityModel.js';

export const allNotes = async (req, res) => {
    try {
        const notes = await Note.find().populate('createdBy', 'name email').populate('leadid', 'name email phone'); 
        res.json({
            status: "success",
            data: notes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

export const addNote = async (req, res) => {
    try {
        const { leadId, noteText, user } = req.body;
        const attachments = req.files ? req.files.map(file => 'uploads/note/' + file.filename) : [];
        const createdBy = user; // Assuming user ID is passed in the request body

        // console.log('Creating note with:', { leadId, noteText, attachments, createdBy });
        if (!leadId || !noteText || !createdBy) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // console.log('Creating note with:', { leadId, noteText, attachments, createdBy });

        const newNote = new Note({
            leadId,
            noteText,
            attachments,
            createdBy
        });
        await newNote.save();

        const newNoteData = await Note.findById(newNote._id)
            .populate('createdBy', 'username email')
            .populate('leadId', 'name email phone');

        const activity = new Activity({
            user: createdBy,
            type: 'note',
            content: "New Note Added",
            contentId: newNote._id,
            leadId: leadId,
            metadata: { 
                name : newNoteData.leadId.name,
                email : newNoteData.leadId.email,
                phone : newNoteData.leadId.phone,
                createdBy : newNoteData.createdBy?.username,
                // note : noteText
             }
        });
        await activity.save();
        res.status(201).json({
            status: "success",
            data: newNote
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateNote = async (req, res) => {
    try {
        const { leadid, noteText, attachments } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { leadid, noteText, attachments },  
            { new: true }
        );  



        
        const activity = new Activity({
            user: updatedNote.createdBy,
            type: 'Note Updated',
            content: noteText,
            contentId: updatedNote._id,
            leadId: leadid,
            metadata: { 
                name : updatedNote.leadId.name,
                email : updatedNote.leadId.email,
                phone : updatedNote.leadId.phone,
                createdBy : updatedNote.createdBy?.username,
                // note : noteText
             }
        })
        await activity.save();  
        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({
            status: "success",
            data: updatedNote
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

export const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({
            status: "success",
            data: deletedNote
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotesByLeadId = async (req, res) => {
    try {
        const notes = await Note.find({ leadId: req.params.leadId })
            .populate('createdBy', 'name email')
            .populate('leadId', 'name email phone');
        res.json({
            status: "success",
            data: notes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('leadId', 'name email phone');
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.json({
            status: "success",
            data: note
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
