
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Typography, Paper, Container, CircularProgress, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { format } from 'date-fns';


const App = () => {

  const [date, setDate] = useState(new Date())
  const [search , setSearh] = useState("")
  const [birthdays, setBirthdays] = useState([])
  const [favorite, setFavorites] = useState(localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [])
  const [loader, setLoader] = useState(false)
 

  const handleFavourites = (e) => {

    const newArr = birthdays.map(ele =>{
      
      if(ele.name == e.name){
        return {...ele , favourite : !e.favourite}
      }else{
        return ele
      }
    })
    console.log(newArr)
    setBirthdays(newArr)

    if(!e.favourite){
      setFavorites([...favorite , e])
      console.log(favorite)
      localStorage.setItem('favourite' , JSON.stringify([...favorite ,e]))

    }
    else{
      const arr = favorite.filter(fav =>{
        return fav.name !== e.name
      })
      console.log(arr)
      setFavorites(arr) 
      localStorage.setItem('favourite',JSON.stringify(arr))
    }

  }

  const favouriteBirthdays = (arr) =>{
    const groupedByBirthday = arr.reduce((acc, curr) => {
      const { d, name } = curr;
      if (!acc[d]) {
        acc[d] = [];
      }
      acc[d].push(name);
      return acc;
    }, {});
    
    const result = Object.keys(groupedByBirthday).map(birthday => ({
      date: birthday,
      names: groupedByBirthday[birthday]
    })); 
     
    return result
  }


  useEffect(() => {

    (async () => {
      setLoader(true)

      try {
        const value = format(date, "MM/dd")
        const fav = JSON.parse(localStorage.getItem('favourite'))?.map(ele => ele.name)

        if(localStorage.getItem(value)){
          const a = JSON.parse(localStorage.getItem(value))
          if(a){
            const f = a.map(ele =>{
              if(fav.includes(ele.name)){
                return {...ele , favourite : true}
              }else{
                return {...ele} 
              }
            })
            setBirthdays(f)
            setLoader(false)
          }else{
            setBirthdays(JSON.parse(localStorage.getItem(value)))
            setLoader(false)
          }
        }else{
          const result = await axios.get(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${value}`)
        if (result) {
          
          const data = result.data.births.map(ele => {
            return { name: ele.text, favourite: false , d : date }
          })
          setBirthdays(data)
          localStorage.setItem(value, JSON.stringify(data))
          setLoader(false)
        }
        }

        
      }
      catch (e) {
        console.log(e)
      }
    })()

  }, [date])

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar value={date} onChange={(newValue) => setDate(newValue)} />
      </LocalizationProvider>


        <div style={{display:"flex"}}>

      {loader ? (<CircularProgress />) : (
          <div>
          <h2>Birthdays on {format(date,"do MMMM")}</h2>
          <input type='text' placeholder='search' value={search}  onChange={(e)=>setSearh(e.target.value)}/>
          <ul>
            {birthdays.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(ele => {
              return (
                <li><IconButton onClick={()=>handleFavourites(ele)}>
                  {ele.favourite ? <StarIcon sx={{color : "blue"}} /> :
                    <StarBorderIcon />}
                </IconButton>
                  {ele.name}</li>
              )
            })}
          </ul>
          </div>)}
          <div>
          <h1>favourites</h1>
          <ul>
            {favouriteBirthdays(favorite).map(ele => {
              return (
                <li><b>{format(new Date(ele.date) , "do MMMM")}</b>
                <p>{ele.names.join(", ")}</p>
                </li>
              )
            })}
          </ul>
          </div>
          
        </div>
      
    </>
  )
}

export default App