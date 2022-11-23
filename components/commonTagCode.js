import axios from '../lib/axios';

export default function CommonCode () {
    return (
        {
            get: function (setTags) {
                let oTags = localStorage.getItem('logosTags')

                if ( oTags  )
                    setTags(oTags)
                    
                axios
                .get('http://localhost:1337/api/tags', {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {//console.log('tags', data); 
                  data.data.forEach(e=>{Object.assign(e, e.attributes)
                    if (e.details)
                      e.details = JSON.parse(e.details)
                  })
          
                    localStorage.setItem('logosRawTags', JSON.stringify(data.data))
                    oTags = this.withHierarchy(data.data)
                    localStorage.setItem('logosTags', oTags)
                    setTags(oTags) 
                })
                .catch((error) => console.log(error))
              },
            withHierarchy: function(data) { 
              
                let children = [], roots = []
                let ordered = data.sort((a,b) => a.name > b.name ? 1 : -1)
        
                ordered.forEach(e => { //most tags have no children
                    e.value = e.id
                    e = JSON.parse(JSON.stringify(e))  //break reaction
                    if (e.parentId)
                        children.push(e)
                    else {
                        e.children = []
                        roots.push(e)

                        e.label = e.name
                    }
                }); 
        
                let lookingForChildren = [...roots]
                lookingForChildren.forEach(e => e.choiceContext = e.name)
        
                while (lookingForChildren.length && children.length)
                {
                    let wouldBeParent = lookingForChildren.shift()
                    for (let i = children.length-1; i>=0; i--)
                        if (wouldBeParent.id == children[i].parentId) {
                            wouldBeParent.children.unshift(children[i])
                            lookingForChildren.push(children[i])
                            children[i].context = wouldBeParent.context ?  wouldBeParent.context + ':' + wouldBeParent.name : wouldBeParent.name
                            children[i].label = children[i].context ?  children[i].context + ':' +children[i].name : children[i].name
                            children[i].parent=wouldBeParent
                            children[i].children = []
                            children.splice(i,1)
                        }
        
                } 
               
                return roots  //this.flattenTags(roots, [])
            },
            withParents(tags) {

                if(Array.isArray(tags))
                    return tags.map(e => this.withParents(e)).flat()

                let line = [tags]
                let rawTags = JSON.parse(localStorage.getItem('logosRawTags'))
   
                if (tags.parentId)
                    line.unshift(rawTags.find(e => e.id == tags.parentId))
                return line
            },
            flattenTags: function(roots, list) {
                let ordered = roots.sort((a,b) => a.name > b.name ? 1 : -1)

                for (let e of ordered) {  
                    let copy = Object.assign({}, e)
                    delete copy.parent
                    list.push(copy)
                    if(copy.children)
                        this.flattenTags(copy.children, list)
                    delete copy.children
                }
        
                return list
            },  
            getTagOptions: function (form, visibleTags) { 
        
                let to = this.getOptions(null, visibleTags)   
                if (form) {
                    let tagIds = form.tags.reduce((c,e)=>{c.push(e.id); return c}, [])
                    to = to.filter(e=>!tagIds.includes(e.id))
                }
               
                return to
            },
            getOptions: function (form, data) {  //options for tag parent
        
                let allVisible = data.slice();
                //self and children cannot be parent
                let notValid = form && form.id ? this.fetchAllChildIds(allVisible.find(e=>e.id==form.id), []) : [] 
        
                let withoutSelfChildren = []
                if (form && form.parentId) 
                    withoutSelfChildren.push({choiceContext: 'move to top', id: null})
                if (form && form.parentId)   
                    notValid.push(form.parentId)
                
        
                for (let i = allVisible.length -1 ; i>= 0; i--)
                    if(!notValid.includes(allVisible[i].id )) {
                        allVisible[i].parent = allVisible[i].children = null
                        withoutSelfChildren.push(allVisible[i])
                    }
                
                return withoutSelfChildren
            },
            store:function (tag, success, fail) {

                tag.parentId = tag.parent ? tag.parent.id : null
          
              let resp
          
              if (tag.id) {
                let updates = {name: state.form.name,description: state.form.description, parentId: state.form.parentId}
          
                //resp = await update('tags', state.form.id, updates)
                axios
                .put('http://localhost:1337/api/tags', {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {console.log('tags', data); 
                  data.data.forEach(e=>Object.assign(e, e.attributes))
          
                  let oTags = this.withHierarchy(data.data)

                   success(oTags)
                  })
                .catch((error) => fail(error))
          
              } else {
          
                tag.userId = localStorage.getItem('userId')
          
                axios
                .post('http://localhost:1337/api/tags', {data: tag}, {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {//console.log('tags', data); 
                    success(data)
                })
                .catch((error) => console.log(error)) //(error) => fail(error))
              }
            },
            displayTime(tin) {
        
                return  Math.floor(tin / 3600).toString().padStart(2, "0") + ":" +
                (Math.floor(tin / 60)  % 60).toString().padStart(2, "0") 
                + ':' + (tin % 60).toString().padStart(2, "0");
            },
            fetchAllChildIds: function(root, childIds) {
                childIds.push(root.id)
                root.children.forEach(e => this.fetchAllChildIds(e, childIds))
        
                return childIds
            }              
      
        
        
        })
    }




