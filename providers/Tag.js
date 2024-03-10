'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios';
import { useAuth } from './Auth'

const Context = createContext({} )


export const TagProvider =  ({ children }) => {

    const [list, setList] = useState([])
    const [tree, setTree] = useState([])
    const [map, setMap] = useState()
    const [access, setAccess] = useState()
    const { jwt, user } = useAuth();


    const fetchSortTags = async () =>  {  
        let data = await axios
        .get(`/api/tags?pagination[limit]=-1&filters[userId][$eq]=${user.id}`, {
          headers: { 'Authorization': `bearer ${jwt}` }
        })
        .catch((error) => console.log(error))
          let rawTags = data.data.data

          let share =   await axios
          .get(`/api/shares?pagination[limit]=-1&filters[accessId][$eq]=u${user.id}`, {
            headers: { 'Authorization': `bearer ${jwt}` }
          })
        .catch((error) => console.log(error))


          let parents = new Set()
          share.data.data.forEach(e =>{ if(e.attributes.inherit) {
            let tag =rawTags.find(f=>f.id==e.attributes.tagId*1) 
            console.log('found ', tag)
            if (!tag || tag.attributes.userId != user.id)
              parents.add(e.attributes.tagId*1)
          }})
         
          console.log('shares', parents)
          data = await axios
          .get(`/api/tags?pagination[limit]=-1&filters[userId][$ne]=${user.id}`, { //todo user from access
            headers: { 'Authorization': `bearer ${jwt}` }
          })
        .catch((error) => console.log(error))

        
        let possible = new Set(data.data.data.concat(rawTags))

        let look = true
        let accessMap = new Map()

        while (look && possible.size) {  
          look = false
        for (const e of possible.values()){

          if (parents.has(e.id)) {
            rawTags.push(e)
            accessMap.set(e.id, e) //todo permission create, grant ... from share
            e.shared='Brian'
            look = true
            possible.delete(e)
          }
          if (!e.attributes.parentId) {
            possible.delete(e)
            look = true
          } else if (parents.has(e.attributes.parentId)){
            rawTags.push(e)
            accessMap.set(e.id, e) //todo permission create, grant ... from share
            possible.delete(e)
            look = true
            parents.add(e.id)
          }

        }         }
           
       setAccess(accessMap) 
     

          rawTags.forEach(e=>{Object.assign(e, e.attributes)
            if (e.details)
              e.details = JSON.parse(e.details)
            e.children = []
          })
  
          let tagMap = new Map()

          let cTags = rawTags.map(e=>{e.key=e.id; e.value=e.id; tagMap.set(e.id, e); return e})
          setMap(tagMap)

          let context = new Map();
          
          let forContext = [...cTags];  

          let previousLength;
          while (forContext.length && (previousLength != forContext.length)) {
            previousLength = forContext.length;
          ( [...forContext]).map((e, i) => {
           if (e.parentId) {
             if (context.get(e.parentId)) {
               context.set(e.id, e.label = context.get(e.parentId) + ':' + e.name)
               forContext.splice(i,1)
             }
           } else {
            e.label = (e.shared? '[' + e.shared + ']' : '' ) + e.name
             context.set(e.id, e.label )
             forContext.splice(i,1)
           }})
        
          }

          cTags.sort((a,b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)
          setList(cTags)

        cTags.forEach(e => {if (e.parentId) tagMap.get(e.parentId).children.push(e)})
          
         setTree(cTags.filter(e => !e.parentId))






    }

  const reset = () => {

    setList([])
  }

  const family = (tags, familyList=[]) => {

    if(Array.isArray(tags)) {
      tags.map(e=>family(e, familyList))
      return familyList
    }    

    familyList.push(tags.id)

    if (tags.children.length) 
      tags.children.map(e=>family(e, familyList))
      
    return familyList

  }

  const  store = function (tag, success, fail) {

    tag.parentId = tag.parent ? tag.parent.id : null

  if (tag.id) {console.log('update', tag)

    //resp = await update('tags', state.form.id, updates)
    axios
    .put(`/api/tags/${tag.id}`, {data: tag}, {
      headers: { 'Authorization': `bearer ${jwt}` }
    })
    .then(({ data }) => {console.log('update tags', data); 
        fetchSortTags()
   
        success(data) 
        })
    .catch((error) => console.log(error)) //fail(error))

  } else {

    tag.userId = user.id

    axios
    .post('/api/tags', {data: tag}, {
      headers: { 'Authorization': `bearer ${jwt}` }
    })
    .then(({ data }) => {//console.log('tags', data); 
      fetchSortTags()
        success(data)
    })
    .catch((error) => console.log(error)) //(error) => fail(error))
  }
}


  const allDetails = (tags, fieldDetails={}) => {

    if(Array.isArray(tags)) {
        tags.map(e=>allDetails(e, fieldDetails))
        return Object.values(fieldDetails)
    }

    if(tags.parentId) 
      allDetails(map.get(tags.parentId), fieldDetails)
    

    if (tags.details && tags.details.fields) 
      tags.details.fields.map(e=>fieldDetails[e.title]=e)

    return Object.values(fieldDetails)
  }

    const findById = (id) => {
      return map.get(id)
    }     

    const resetTags = () => {
      console.log('reset')
      setList([])
    }

    const getList = () => { 
        if (user && (!list || list.length == 0)) {console.log('getting')
            fetchSortTags()
        }

        return list
    }

    const withContext = (tags) => {
      tags.map(e => e.label = map.get(e.id).label)
      return tags
    }

    const getAccess = () => { 
      return access
    }

    const getTree = () => {
        if (!list || list.length == 0) {
            fetchSortTags()
        }

        return tree
    }

    return (
        <Context.Provider  value={{resetTags, getAccess, getList, getTree, store, findById, allDetails, family, withContext }}>
            {children}
        </Context.Provider>
     )
}


export const useTags = () => useContext(Context)