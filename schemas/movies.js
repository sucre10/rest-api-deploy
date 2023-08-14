const z = require('zod') // 'zod' para validar datos

// squema de validadciones
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  // year: z.number().int().positive().min(1900).max(2024),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  // rate: z.number().min(0).max(10),
  // rate: z.number().min(0).max(10).optional(),
  // rate: z.number().min(0).max(10).nullable(),
  rate: z.number().min(0).max(10).default(5), // si no pasamos valores, por defecto introducira 5
  // poster: z.string().url().endsWith('.jpg') // endsWith('.jpg'): que termine con jpg
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  // genre: z.array(z.string()) //ilimitado de string
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required.',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (input) {
  // return moviesSchema.parse(object)
  // safeParse(object): develve un objeto resolve que dice si hay error o hay datos
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  // partial(): hace que todas las propiedades son opcionales (si no esta no pasa nada, si esta validará)
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
