import {Notes} from "./notes.js"

class ToDo extends Notes{
    constructor(title ,description ,type){
        super(title,description,type)
        
        this.completed = false;
    }
}

class Text extends Notes{
     constructor(title ,description ,type){
        super(title,description,type)
        
     }
}


export function createNote(title ,description ,type){
    
    if(type == "text"){
        return new Text(title ,description ,type)
    }
    else if(type == "todo"){
        return new ToDo(title ,description ,type)
    }else{
        console.error("Unknown note type:", type);
        return null;
    }

    
}