// ----------------------------------------------------
// Librerias en el servidor
// ----------------------------------------------------
const express = require('express');

const Tesseract = require('tesseract.js');  
const multer = require('multer');

const sharp = require('sharp')

const fs = require('fs');

const path = require('path');
const logger = require('morgan');

const app = express();


// ----------------------------------------------------
// Configuraciones del Servidor
// ----------------------------------------------------
function server(app){

    // ----------------------------------------------------
    // Settings
    // ----------------------------------------------------

    // Configuracion de ejs
    app.set( "views",path.join(__dirname, "../views") )
    app.set( 'view engine', 'ejs' );

    // ----------------------------------------------------
    // Middleware
    // ----------------------------------------------------
    app.use( logger('dev') );
    app.use( express.json() );

    // ----------------------------------------------------
    // Archivos estaticos
    // ----------------------------------------------------
    app.use( express.static(path.join(__dirname,"../public")) )

}

server(app)
// ----------------------------------------------------

let contador = 0
let array = []

// ----------------------------------------------------
// Configuración de MULTER Middleware
// ----------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${ path.join(__dirname,"../public/images") }`) // Especifica la ubicación donde se guardarán las imagenes .png .jpg .jpeg .gif y otros
  },
  filename: (req, file, cb) => {
    // Nombre Original del archivo
    // console.log(`${contador} Nombre original del archivo ${file.originalname}`)
    // cb(null, Date.now() + path.extname(file.originalname))
    cb( null, file.originalname )
  }
})

const upload = multer({ storage })

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// Ruta de subir la imagen
app.get('/', (req, res, next) => {
  res.render('init.ejs')
})
// ----------------------------------------------------

// Ruta de subir la imagen
app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {

    let imagePath = req.file.path;

    console.log(req.body)

    // Validar Nombre
    let user_name = req.body.name;
    let user_sur_name = req.body.surname.split(' ');
    let user_ape1 = user_sur_name[0]
    let user_ape2 = user_sur_name[1]
    let user_surname = [];

    // for(let i= 0;i>user_sur_name;i++){
      
    //   if( user_sur_name[i].includes(à) || user_sur_name[i].includes(á)){

    //   }else if( user_sur_name[i].includes(è) || user_sur_name[i].includes(é) ){

    //   }else if( user_sur_name[i].includes(ì) || user_sur_name[i].includes(í) ){

    //   }else if( user_sur_name[i].includes(ò) || user_sur_name[i].includes(ó)){

    //   }else if( user_sur_name[i].includes(ù) || user_sur_name[i].includes(ó)){

    //   }
    // }

    let user_dni = req.body.dni
    
    let user_data = [user_name, user_ape1, user_ape2, user_dni];

    // console.log('Aqui esta',  imagePath)
    // console.log(req.file.originalname)

    // ----------------------------------------------------
    // CREAR CARPETA
    // ----------------------------------------------------

    if (fs.existsSync( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}`) )) {
      // la carpeta existe

      fs.rmdirSync( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}`), { recursive: true } );
      //console.log('La carpeta ha sido borrada.');

      fs.mkdir( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}`),(erro) => {
        if (erro) {
          throw erro;
        }else{
          console.log('Carpeta Creada')
        }
      })
      

    } else {
      // la carpeta no existe

      fs.mkdir( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}`),(erro) => {
        if (erro) {
          throw erro;
        }else{
          console.log('Carpeta Creada')
        }
      })

    }

    


    // ----------------------------------------------------
    //  FILTROS a las Imagenes del Servidor
    // ----------------------------------------------------
     
    // Filtro a escala de grises
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
    // Aplicando filtro de Escala de grises
    .grayscale()
    // Guardar el resultado en una imagen de respaldo
    .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Escala_grises_${req.file.originalname}`) ,
      (err, info) => {
        if(err){
          console.log(err);
        }
        else{
          console.log('Filtro De Grises Aplicado');
        }
    });

    // Filtro de Umbralización
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
    // Aplicando filtro de umbralización
    .threshold(115)
    // Guardar el resultado en una imagen de respaldo
    .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Unbralizacion_${req.file.originalname}`),
    (err, info) => {
        if(err){
          console.log(err);
        }
        else{
          console.log('Filtro De Umbral Aplicado');
        }
    });


    // Filtro de Reduccion de Ruido
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
    // Aplicando filtro de umbralización
    .median(3)
    // Guardar el resultado en una imagen de respaldo
    .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Reduccion_Ruido_${req.file.originalname}`),
    (err, info) => {
        if(err){
          console.log(err);
        }
        else{
          console.log('Filtro De Reduccion de Ruido Aplicado');
        }
    });
    

    // Filtro de Eliminacion de Fondo
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
    //.extract({ r: 0, g: 255, b: 0 }) // extraer píxeles verdes
    .blur(5) // aplicar un filtro de desenfoque para suavizar los bordes
    //.composite([{ input: 'background.jpg' }]) // superponer una imagen de fondo
    .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Eliminacion_Fondo_${req.file.originalname}`), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Filtro De Eliminacion de Fondo Aplicado');
      }
    });

    // My Filtro Personalizado 0.0.1
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
      // Extraer el canal correspondiente a la intensidad de la imagen en escala de grises
      .extractChannel('red')
      // Aplicar un filtro de umbralización para obtener los píxeles negros
      .threshold(0, 255, { grayscale: true })
      // Convertir todo lo demás a blanco
      .toColorspace('b-w')
      // Superponer la imagen original con la imagen umbralizada para resaltar el texto negro
      .composite( [{ input: path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Unbralizacion_${req.file.originalname}`) }])
      // Aplicando filtro de Nitidez
      .sharpen({sigma: 10, flat: 10, jagged: 10})
      // Guardar la imagen resultante
      .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Filtro_Personalizado_${req.file.originalname}`), (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Filtro Personalizado Aplicado');
        }
      });

    // Filtro de Nitidez
    sharp( path.join(__dirname,`../public/images/${req.file.originalname}`) )
    // Aplicando filtro de Nitidez
    .sharpen({sigma: 10, flat: 10, jagged: 10})
    // Guardar el resultado en una imagen de respaldo
    .toFile( path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Nitidez_${req.file.originalname}`),
    (err, info) => {
        if(err){
          console.log(err);
        }
        else{
          console.log('Filtro De Nitidez Aplicado');
        }
    });

    let pers = path.join(__dirname,`../public/images/Filtros-${req.file.originalname}/Escala_grises_${req.file.originalname}`)

    //Tesseract.recognize(imagePath, 'spa', `${ path.join(__dirname,"../public/languages/spa.traineddata") }` )
    Tesseract.recognize(pers, 'spa', `${ path.join(__dirname,"../public/languages/spa.traineddata") }` )
      .then(result => {

        // Resultado Exitoso de la Promesa de Tesseract OCR

        // Objeto image

        let image = {
          posicion: '',
          nombre: '',
          ocr: '',
          validaciones: []
        }

        image.posicion = contador
        image.nombre = req.file.originalname

        image.ocr = result.data.text.split('\n')

        // ----------------------------------------------------
        //  VALIDANDO DATOS DEL FORMULARIO Y OCR Tesseractjs
        // ----------------------------------------------------

        for(let i = 0; i<user_data.length; i++){
          let seccion = []
          seccion.push(user_data[i])

          for(let j = 0; j<image.ocr.length; j++){

            if(image.ocr[j].includes(user_data[i])){
              // Encontrado
              seccion.push('true')
              image.validaciones.push(seccion)
              break

            }else{
              // No encontrado
              if(j == (image.ocr.length -1)){
                seccion.push('false')

                image.validaciones.push(seccion)
              }

            }
          }
        }

        console.log(image.validaciones)

        array.push(image)
        contador++

        console.log(array)

        res.render('checkeds.ejs', { array: array } )

      })
      .catch(err => {
        console.log(err);
        res.send('Ocurrió un error al procesar la imagen.');
      });
  }
  else {
    res.send('No se ha subido ninguna imagen.');
  }
});
// ----------------------------------------------------

// Ruta de Comprobar Imagenes en el servidor
app.get('/checkeds', (req, res, next) => {
  res.render('checkeds.ejs', {array})
})
// ----------------------------------------------------

app.listen(3000, () => console.log('Servidor iniciado en el puerto 3000'));


