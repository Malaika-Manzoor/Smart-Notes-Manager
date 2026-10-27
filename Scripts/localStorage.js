export function saveNotes(notes){
    const notesData = notes.map(note=>({
        title:note.title,
         storageId: note.storageId,
        description:note.description,
        type:note.type,
        viewed: note.viewed || false,
        completed: note.completed ?? false,
        location:note.location
    }))

    localStorage.setItem("notes",JSON.stringify(notesData))

}

export function loadNotes(){
    return JSON.parse(localStorage.getItem("notes"))||[]
}