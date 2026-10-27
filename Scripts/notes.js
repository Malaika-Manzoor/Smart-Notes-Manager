export class Notes{
     constructor(title, description, type) {
        this.id = Symbol("note");
        this.storageId = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.type = type;
    }
}

export const viewedNotes = new WeakMap();

export function NotelogChanges(note) {
    return new Proxy(note,{
        set(target,property,value){
            console.log(`Notes chnaged:${String(property)}`,"\nOld Values:" ,Reflect.get(target,property),"\nNew Values:",value)
            return Reflect.set(target,property,value)
        }
        
        
    })

    
}