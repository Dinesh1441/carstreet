import mongoose  from "mongoose";


const noteSchema = new mongoose.Schema({
    leadId : { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    noteText: { type: String, required: true },
    attachments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
export default Note;