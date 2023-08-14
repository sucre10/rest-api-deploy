// importamos framework de EXPESS
const express = require('express') // require ->commonJS
const crypto = require('node:crypto') // para crear "id"
const cors = require('cors') // importar Mallware 'cors'
// importar base de datos
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express() // creamos la aplicaion con express

app.use(express.json()) // es una madelware, para usar en POST,

app.use(cors({
  origin: (origin, callback) => {
    // lista de url permitidas al servidor para CORS:
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://movies.com',
      'http://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) { // si incluye origin, entonces:
      return callback(null, true)
    }

    if (!origin) { // si no tiene origen
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

// Metodos normales: GET/HEAD/POST
/** métodos complejos: PUT/PATH/DELETE
 *    CORS PRE-Flight
 *   Estos metodos(PUT/PATH/DELETE) requieren de una peticion especial, llamada OPTIONS
 */

app.disable('x-powered-by') // deshabilita el header x-Powered-By: Express

// metodo GET
// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
  // const { genre, director } = req.query  //se pueden recuperara varias, para hacer operaciones
  const { genre } = req.query
  // http://localhost:1234/movies?genre=Action  filtra para movies cuyo 'genre = Antion'
  if (genre) {
    const filteredMovies = movies.filter(
      // movie => movie.genre.includes(genre)
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // comparamos el genero todo en minuscula
      // o sea http://localhost:1234/movies?genre=action o http://localhost:1234/movies?genre=ActiON
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// app.get('/ab(cd)E/', (req, res) => { // abe, abcde
app.get('/movies/:id', (req, res) => { // :id  es para capturar id de la base de datos y usar en codigo
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

// Metodo POST  http://localhost:1234/movies
app.post('/movies', (req, res) => {
  // squema de validadciones de los datos 'req.body'
  // req.body: son los datos sin validar, y lo que retorna de validacion sera 'result.data'
  const result = validateMovie(req.body)

  // vemos como lefue a la validacion:
  // if (!result.success) {
  if (result.error) {
    // url = http.cat  lista de errores
    // aqui tambie se puede usar 422 Unprocessable Entity en lugar de 400

    // 400 bad request, que indica que el cliente ha echo algo para ese error
    return res.status(400).json({ error: JSON.parse(result.error.message) })

    // return res.status(400).json({ error: JSON.result.error.message })
  }
  // fin validacion

  // en base de datos
  const newMovie = {
    id: crypto.randomUUID(), // crea id     uuid v4
    ...result.data // si esta validado entonces se coloca directo '...result.data'
  }

  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicaion en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie) // actualizar la cache del cliente)
})

// metodo 'DELETE' .....
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// Metodo PATCH http://localhost:1234/movies/dcdd0fad-a94c-4810-8acc-5f108d3b18c3
app.patch('/movies/:id', (req, res) => {
  // squema de validadciones de los datos 'req.body'
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  // const { title, duration } = req.body

  // ***** PARA LA BASE DE DATOS *****
  // como todo ya esta validado, entonces:
  const updateMovie = {
    ...movies[movieIndex], // ...movies[movieIndex]: todo lo que recuperamos de movies
    ...result.data // ...result.data: todo lo que paso el usuario
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// Si el puerto viene por variable de entorno, tomar eso, caso contrario el puerto "1234"
const PORT = process.env.PORT ?? 1234

// levantar y escuchar el puerto
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
