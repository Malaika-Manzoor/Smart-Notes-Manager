export class NotesStore{
    constructor(){
        if(NotesStore.instance){
            return NotesStore.instance
        }
        this.notes=[]
        NotesStore.instance= this

    }

    addNotes(note){
        this.notes.push(note)
    }

    getNotes(){
        return this.notes
    }

    deleteNote(noteDel){
        this.notes = this.notes.filter(note=>note.storageId !== noteDel.storageId)
    }

    updateNote(noteUp){
        const note = this.notes.find(item=>item.storageId === noteUp.storageId)
        if(!note){
            return
        }
        note.title = noteUp.title
        note.description = noteUp.description
        note.type = noteUp.type
    }
}