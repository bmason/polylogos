'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios';

const Context = createContext({} )


export const TagProvider =  ({ children }) => {

    const [list, setList] = useState([])
    const [tree, setTree] = useState([])
    const [map, setMap] = useState()

    const fetchSortTags = () => {
        axios
        .get('/api/tags?pagination[limit]=-1', {
          headers: { 'Authorization': `bearer ${localStorage.getItem('jwt')}` }
        })
        .then(({ data }) => {
          data.data.forEach(e=>{Object.assign(e, e.attributes)
            if (e.details)
              e.details = JSON.parse(e.details)
            e.children = []
          })
  
          let tagMap = new Map()

          let cTags = data.data.map(e=>{e.key=e.id; tagMap.set(e.id, e); return e})
          setMap(tagMap)

          let context = new Map();
          
          let forContext = [...cTags];  
          //console.log(forContext);
          let previousLength;
          while (forContext.length && (previousLength != forContext.length)) {
            console.log('length ', forContext.length)
            previousLength = forContext.length;
          ( [...forContext]).map((e, i) => {
           if (e.parentId) {
             if (context.get(e.parentId)) {
               context.set(e.id, e.label = context.get(e.parentId) + ':' + e.name)
               forContext.splice(i,1)
             }
           } else {
             context.set(e.id, e.label = e.name)
             forContext.splice(i,1)
           }})
        
          }
          //console.log('after cTags', cTags)
          cTags.sort((a,b) => (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0)
          setList(cTags)

        cTags.forEach(e => {if (e.parentId) tagMap.get(e.parentId).children.push(e)})
          
         setTree(cTags.filter(e => !e.parentId))
    console.log('tree', cTags.filter(e => !e.parentId))

        })
        .catch((error) => console.log(error))

    }

    const findById = (id) => {
      return map.get(id)
    }     

    const getList = () => { //console.log('getList')
        
        if (!list || list.length == 0) {console.log('getting')
            fetchSortTags()
        }

        return list
    }

    const getTree = () => {
        if (!list || list.length == 0) {
            fetchSortTags()
        }

        return tree
    }

    return (
        <Context.Provider  value={{ getList, getTree, findById }}>
            {children}
        </Context.Provider>
     )
}


export const useTags = () => useContext(Context)