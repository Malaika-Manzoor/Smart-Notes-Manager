import {viewedNotes ,NotelogChanges} from "./notes.js"
import { NotesStore } from "./notesStore.js"
import { createNote } from "./factoryNotes.js"
import { saveNotes,loadNotes } from "./localStorage.js"
import {NoteLocation} from "./notesLocation.js"

const title = document.querySelector("#title")
const des = document.querySelector("#des")
const type = document.querySelector("#type")
const form = document.querySelector("#AddNotes")
const notesList = document.querySelector(".notesList")
const submitButton = form.querySelector('input[type="submit"]')
const successMessage = document.querySelector("#SucessMessage")
const filter = document.querySelector("#filter")
const sort = document.querySelector("#sort");
const searchInput = document.querySelector("#srch");
const scrollLoader = document.querySelector("#scrollLoader")

const noteLocation = new NoteLocation();

let visibleNotes = 5;
const notesPerLoad = 5;
let loading = false;
let edit = null
let store = new NotesStore();
const savedNotes = loadNotes()

savedNotes.forEach((data) => {
    const notes = createNote(
        data.title,
        data.description,
        data.type
    );
    notes.storageId = data.storageId;
    notes.viewed = data.viewed || false;
    notes.completed = data.completed ?? false;
    notes.location = data.location ?? null;

    const logNotes = NotelogChanges(notes);
    store.addNotes(logNotes);
    
});

// let store2 = new NotesStore()
// console.log(store1===store2)

const observer = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting || loading) return;

  const result = compose(sortNotes, filterNotes)(store.getNotes());

  if (visibleNotes >= result.length) {
    scrollLoader.textContent = "All notes loaded!";
    observer.unobserve(scrollLoader);
    return;
  }

  loading = true;
  scrollLoader.textContent = "Loading more notes...";

  setTimeout(() => {
    visibleNotes += notesPerLoad;
    updateNotesList();
    loading = false;
  }, 500);

}, { threshold: 0.1 });
  updateNotesList();

function renderNotes(notes){

    const card = document.createElement("div")
    notesList.appendChild(card)
    const titleNote = document.createElement("h3")
    const desNote = document.createElement("p")
    card.appendChild(titleNote)
    card.appendChild(desNote)

    if(notes.type == "todo"){
         const label = document.createElement("label")
         label.classList.add("labelTodo")
         const check = document.createElement("input")
         check.type= "checkbox"
         check.checked = notes.completed
         const todoText = document.createElement("span")
         todoText.textContent = notes.completed? "Completed": "Mark as done";
         label.append(check,todoText)
         card.appendChild(label)

         card.classList.toggle("Completed",notes.completed)
         check.addEventListener("change",()=>{
            notes.completed = check.checked
            todoText.textContent = notes.completed? "Completed": "Mark as done";
            card.classList.toggle("Completed",notes.completed)
            saveNotes(store.getNotes())
         })
    }
   
    const viewButton = document.createElement("button")
    card.appendChild(viewButton)
    
    viewButton.textContent = notes.viewed ? "Viewed" : "View Notes";
    viewButton.classList.toggle("Viewed", notes.viewed);
    viewButton.classList.add("ViewNotes")
     
    viewButton.addEventListener("click",()=>{
            viewedNotes.set(notes ,true)
            notes.viewed = true;
            console.log("Viewed Notes" ,viewedNotes.get(notes))
            viewButton.textContent = notes.viewed ? "Viewed" : "View Notes";
            viewButton.classList.add("Viewed")
            viewButton.classList.toggle("Viewed", notes.viewed);
            saveNotes(store.getNotes())     
    })

    const deleteButton = document.createElement("button")
    deleteButton.textContent= "delete"
    deleteButton.classList.add("DeleteButton")

    deleteButton.addEventListener("click",()=>{
        store.deleteNote(notes)
        saveNotes(store.getNotes())
        card.remove()
        alert("Do you want to delete this note!!!")
    })
    card.appendChild(deleteButton)
   
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("EditNotes");

    editButton.addEventListener("click" ,()=>{
        title.value = notes.title;
        des.value = notes.description;
        type.value = notes.type;
        edit = notes;
        submitButton.value = "Update Notes";
        title.focus();
        
    })

    card.appendChild(editButton)
    const actions = document.createElement("div");
    actions.classList.add("NoteActions");
    actions.appendChild(viewButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(actions);

    // notesList.addEventListener("click",(event)=>{
    //     const button = event.target.closet("button")
    //     const card = event.target.closet("card")

    // }) //trying to do event dalegation but i have already add manaually event listeners

    titleNote.textContent= notes.title
    desNote.textContent= notes.description  
    const locationNote = document.createElement("p");
    console.log(notes.location)

    if (notes.location) {
    locationNote.textContent =`Location :  ${notes.location.latitude.toFixed(2)}, ${notes.location.longitude.toFixed(2)}`;
    } else {
    locationNote.textContent = "Location unavailable";
    }

    locationNote.classList.add("NoteLocation"); 
    card.classList.add("Notescard")
    card.appendChild(locationNote);
   
}

function filterByType(type){
    return function(note){
        return type ==="All" || type===note.type
    }
}

function filterNotes(notes) {
    return notes.filter(filterByType(filter.value));
}

function sortNotes(notes) {
    const copy = [...notes];

    if (sort.value === "Newest") {
        return copy.reverse();
    }

    return copy;
}

function compose(...functions) {
    return function (value) {
        return functions.reduceRight(
            (result, fn) => fn(result),
            value
        );
    };
}
function updateNotesList() {
    const result = compose(sortNotes, filterNotes)(store.getNotes());

    notesList.innerHTML = "";

    const visible = result.slice(0, visibleNotes);
    visible.forEach(renderNotes);

    console.log("Total:", result.length, "Visible:", visibleNotes);

    observer.unobserve(scrollLoader);

    if (visibleNotes < result.length) {
        scrollLoader.textContent = "Scroll down to load more notes...";
        observer.observe(scrollLoader);
    } else {
        scrollLoader.textContent = "All notes loaded!";
    }
}
filter.addEventListener("change",()=>{
    visibleNotes = 5;
    updateNotesList()
});
sort.addEventListener("change",()=>{
    visibleNotes = 5;
    updateNotesList()
});

function searchNotes(notes,query){
    const searchText = query.trim().toLowerCase()
    return notes.filter((note)=>{
        return(
            note.title.toLowerCase().includes(searchText)||
            note.description.toLowerCase().includes(searchText)
        )
    })
}

function handelSearch(){
    console.log("Search input:", searchInput.value);
    const searched = searchNotes(store.getNotes(),searchInput.value)
    notesList.innerHTML=""
    searched.forEach(renderNotes)

}

function debounce(callback,delay){
    let timer ;
    return function(...args){
        clearTimeout(timer)
        timer = setTimeout(() => {
            callback(...args)
        }, delay);
    }
}

searchInput.addEventListener("input",
    debounce(handelSearch,2000))

function throttle(callback,delay){
    let wait = false;
    return function (...args) {
        if(wait ){
            return 
        }

        callback(...args)
        wait = true

        setTimeout(() => {
            wait=false
        }, delay);
    }

}

function handelScrol(){
    console.log("Handel scrol",window.scrollY)
}
window.addEventListener("scroll",throttle(handelScrol,4000))


// filter.addEventListener("change",()=>{
//     let filterType = filter.value
//     const filteredNotes = store.getNotes().filter(filterByType(filterType))
//     notesList.innerHTML=""
//     //filteredNotes.forEach(renderNotes);
//     filteredNotes.forEach((note) => {
//         renderNotes(note);
//     })
// })//pehle ase kkrahhi thi single filter ab combine krk aik hi update function me daldia

form.addEventListener("submit" , async (event)=>{
    event.preventDefault()
    // let notes = new Notes(title.value,des.value,type.value) before factory 
    if (edit) {
        store.updateNote({
            storageId: edit.storageId,
            title: title.value,
            description: des.value,
            type: type.value
        });

        saveNotes(store.getNotes());

        notesList.innerHTML = "";
        store.getNotes().forEach(renderNotes);

        edit = null;
        form.reset();
        submitButton.value = "Add Notes"
        successMessage.textContent = "Note Updated Sucessfully"  
        setTimeout(() => { 
          successMessage.textContent = "";
        }, 2000);
        return;
    }
    const location = await noteLocation.getLocation();
    const notes = createNote(title.value,des.value,type.value)
    notes.location = location;
    const logNotes = NotelogChanges(notes)
    // const notes={
    //     title:title.value,
    //     description:des.value,
    //     type:type.value
    // } //without class

    store.addNotes(logNotes);
    let getnotes =  store.getNotes()
    console.log("all notes" ,getnotes)
    saveNotes(getnotes)
    successMessage.textContent = "Note Add Sucessfully" 
    setTimeout(() => {
           successMessage.textContent = "";
    }, 2000);
    renderNotes(logNotes)

    // localStorage.setItem("notes" ,JSON.stringify(getnotes.map(note=>({
    //     title:note.title,
    //     description:note.description,
    //     type:note.type
    // }))))
    
    // allNotes[0].title = "updated title"
    // console.log("All note IDs:", allNotes.map(note => note.id));
    // if (allNotes.length >= 2) {
    //     console.log("Are IDs same?",allNotes[0].id === allNotes[1].id
    //     );
    // }
    
    form.reset()

})

