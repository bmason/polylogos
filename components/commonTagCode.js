import { GiConcentrationOrb } from 'react-icons/gi';
import axios from '../lib/axios';
import {HStack, Stack, Input, useToast, Box, Button, Heading, Text, SimpleGrid, IconButton  } from "@chakra-ui/react";


export default function CommonCode () {
    return (
        {
            get: function (setTags) {
                let oTags //= localStorage.getItem('logosTags')

               // if ( oTags  )
               //     setTags(oTags)
                    
                axios
                .get('/api/tags?pagination[limit]=-1', {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {//console.log('tags', data); 
                  data.data.forEach(e=>{Object.assign(e, e.attributes)
                    if (e.details)
                      e.details = JSON.parse(e.details)
                  })
          
                    localStorage.setItem('logosRawTags', JSON.stringify(data.data))
                    oTags = this.withHierarchy(data.data)
                    //localStorage.setItem('logosTags', JSON.stringify(oTags))
                    setTags(oTags) 
                })
                .catch((error) => console.log(error))
              },
              family: function (parent, tags) {
               
                let pih = this.findInHierarchy(parent, tags)
                //console.log('found',pih)
                let wc = this.withChildren(pih)
                return wc
              },
              withChildren (parent) {
                let ret = [parent]
                //console.log('parent', parent)
                parent.children.forEach(e => {
                    ret = ret.concat(this.withChildren(e))
              })
                return ret
              },
              findInHierarchy(tag, tags) {
                for (let i =0; i<tags.length; i++) {
                    let found 
                    if (tags[i].id == tag.id)
                        return tags[i]
                    else 
                        if ( found = this.findInHierarchy(tag, tags[i].children))
                            return found
                }
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
            delete(tagId, setTags) {
                axios
                .delete(`/api/tags/${tagId}`, {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {console.log('del tags', data); 

                let rawTags = JSON.parse(localStorage.getItem('logosRawTags'))
                rawTags = rawTags.filter(e=>e.id!=tagId)

                localStorage.setItem('logosRawTags', JSON.stringify(rawTags))
                let oTags = this.withHierarchy(rawTags)
                //localStorage.setItem('logosTags', JSON.stringify(oTags))
                setTags(oTags) 
                })
                .catch((error) => console.log(error))


            },

            withParents(tags) {

                if(Array.isArray(tags))
                    return tags.map(e => this.withParents(e)).flat()

                let line = [tags]

   
                if (tags.parentId) {
                    let rawTags = JSON.parse(localStorage.getItem('logosRawTags'))
                    line.unshift(rawTags.find(e => e.id == tags.parentId))
                
                    if (line[0].parentId)
                        line.unshift(this.withParents(line[0]))
                        line = line.flat()
                }

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
          
              if (tag.id) {console.log('update', tag)
          
                //resp = await update('tags', state.form.id, updates)
                axios
                .put(`/api/tags/${tag.id}`, {data: tag}, {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {console.log('update tags', data); 

                    let rawTags = JSON.parse(localStorage.getItem('logosRawTags'))
                    let updatedTag = rawTags.find(e => e.id == tag.id)
                    Object.assign(updatedTag, data.data.attributes)

                    localStorage.setItem('logosRawTags', JSON.stringify(rawTags))
                    success(data) 
                    })
                .catch((error) => console.log(error)) //fail(error))
          
              } else {
          
                tag.userId = localStorage.getItem('userId')
          
                axios
                .post('/api/tags', {data: tag}, {
                  headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
                })
                .then(({ data }) => {//console.log('tags', data); 
                    success(data)
                })
                .catch((error) => console.log(error)) //(error) => fail(error))
              }
            },
            displayTime(tin) {
                let negative = false
                if (tin< 0) {
                    tin = 0 - tin
                    negative = true
                }

                let timeString = Math.floor(tin / 3600).toString().padStart(2, "0") + ":" +
                (Math.floor(tin / 60)  % 60).toString().padStart(2, "0") 
                + ':' + (tin % 60).toString().padStart(2, "0");

                return {timeString: timeString, negative: negative}
            },
            fetchAllChildIds: function(root, childIds) {
                childIds.push(root.id)
                root.children.forEach(e => this.fetchAllChildIds(e, childIds))
        
                return childIds
            },              
            withContext(tags, allTags) {

                return tags.map(e=>allTags.find(f=>f.id==e.id))
            },
            format(item, tags) {
//console.log('format', item,tags)
                if (item.details && item.details.amount)
                    return (
                    <HStack>
                        <Text>{item.details.date }</Text>
                    <Text>{'amount:'}</Text>
                    {item.details.currency && <Text>{item.details.currency}</Text>}
                        <Text>{item.details.amount}</Text> 
                    </HStack>
                ) 
                

                    console.log(item)
            }
        
        })
    }




