const express = require('express');
const app = express();
const { createServer } = require('node:http');
const { emit } = require('node:process');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })
const mime = require('mime')

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(cors({
    origin: '*'
}))

//variables
const connectedUsers = []
let gameState = 'off'
let cuestionarioSeleccionado
let pregunta = 0
let respondidas = 0

io.on('connection', (socket) => {
    console.log('Cliente conectado: ' + socket.id);

    socket.on('joinRoom', (data) => {

        if (data.username === 'admin') {
            connectedUsers.splice(0, connectedUsers.length);
            gameState = 'waiting'
            console.log('Admin con id: ' + socket.id + ' creo la sala');
            socket.join('admin') //servicio propio del admin
        } else {
            if (gameState === 'on') {
                socket.emit('gameState', gameState);
            } else {
                if (gameState === 'waiting') {
                    socket.join('client');
                    const user = {
                        username: data.username,
                        id: socket.id,
                        puntaje: 0
                    }
                    connectedUsers.push(user)
                    console.log('Cliente con id: ' + socket.id + ' y nombre' + data.username + ' unido a la sala');
                    io.emit('updateList');
                } else {
                    socket.emit('gameState', gameState);
                }
            }
        }
    })

    socket.on('exitRoom', (data) => {
        if (data.username === 'admin') {
            console.log('Admin con id: ' + socket.id + ' salio de la sala');
            connectedUsers.length = 0;
            socket.leave('admin');
            io.emit('updateList');
            io.emit('terminarJuego');
        } else {
            socket.leave('client');
            connectedUsers.forEach((user, index) => {
                if (user.id === socket.id) {
                    connectedUsers.splice(index, 1);
                }
            })
            console.log('Cliente con id: ' + socket.id + ' y nombre' + data.username + ' salio de la sala');
            io.emit('updateList');
        }
    })

    socket.emit('connectedUsers', connectedUsers);

    //GAME LOGIC - ADMIN
    socket.on('iniciarJuego',async (data) => { //inicia el juego y manda la primer pregunta del archivo seleccionado
        cuestionarioSeleccionado = ""
        pregunta = 0
        console.log(data)
        cuestionarioSeleccionado = await obtenerFormulario(data);
        preguntaActual = cuestionarioSeleccionado.preguntas[pregunta]

        io.to('client').emit('iniciarJuego', preguntaActual, () => {
            gameState = 'on'
            console.log('juego iniciado')
        });
    })

    socket.on('actualizarPuntaje', (data) => { //actualiza puntajes de el usuario y pasa a la siguiente pregunta
        let contador = 20
        const user = connectedUsers.find(item => item.username == data.username)
        user.puntaje += data.puntaje
        respondidas++
        if (respondidas === connectedUsers.length) { //cuando alcanza el maximo

            //enviamos respuesta al cliente despues de que todos contestaron
            io.to('admin').emit('respuesta', cuestionarioSeleccionado.preguntas[pregunta].respuesta)

            const interval = setInterval(() => {
                io.to('admin').emit('contador', contador)
                contador--;
            }, 1000);

            setTimeout(() => {
                clearInterval(interval)
                io.emit('updateList');
                pregunta++
                preguntaActual = cuestionarioSeleccionado?.preguntas[pregunta]
                if (preguntaActual !== undefined) { //si hay preguntas siempre avanzo a la siguiente
                    io.to('client').emit('siguientePregunta', preguntaActual, () => {
                        console.log('Siguiente pregunta')
                    });
                } else { //si no mando resultado a el cliente y avizo de finalizado al admin
                    console.log('Juego terminado')
                    io.to('admin').emit('juegoTerminado',()=>{
                        io.to('client').emit('finalizando')
                    })
                    
                }
                respondidas = 0
            }, 22000)
        }
    })

    socket.on('terminar', () => { //termina y reinicia el servidor
        cuestionarioSeleccionado = null
        pregunta = 0
        respondidas = 0
        connectedUsers.splice(0, connectedUsers.length);
        io.to('client').emit('terminarJuego', () => {
            gameState = 'off'
            console.log('Terminar juego')
        });
    })

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

//app.use(express.json());

///admin cuestionarios
app.post('/crearCuestionario', upload.any(), (req, res) => { //crea un cuestionario
    console.log(req.body)
    console.log(req.files)

    const preguntas = [];
    const aux = req.body.preguntas

    aux.forEach((preguntaStr) => {
        preguntas.push(JSON.parse(preguntaStr));
    });

    try {

        const data = {
            titulo: req.body.titulo,
            preguntas: preguntas
        }

        const cuestionario = JSON.stringify(data);

        fs.mkdirSync('cuestionarios', { recursive: true })

        fs.writeFile('cuestionarios/' + req.body.titulo + '.json', cuestionario, (err) => {
            if (err) throw err;
            console.log('Cuestionario creado');
            res.status(200).json({ message: 'Cuestionario creado' })
        })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

app.get('/cuestionarios', (req, res) => { //obtiene todos los cuestionarios
    try {
        const cuestionariosFolder = path.join(__dirname, 'cuestionarios');

        fs.readdir(cuestionariosFolder, (err, files) => {
            if (err) {
                console.error('Error al leer la carpeta cuestionarios:', err);
                res.status(500).send('Error interno del servidor');
                return;
            }
    
            // Filtrar los nombres de archivo eliminando las extensiones
            const nombresCuestionarios = files.map(file => path.parse(file).name);
            // Enviar los nombres de los cuestionarios como respuesta
            res.json({ cuestionario: nombresCuestionarios });
        })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

app.get('/cuestionario/:titulo', (req, res) => { //obtiene un cuestionario en especifico
    try {
        const titulo = req.params.titulo
        const cuestionarios = JSON.parse(fs.readFileSync('cuestionarios/'+titulo+'.json'));

        const obj = Object.assign({},cuestionarios)

        const filePromises = [];

        for (let i = 0; i < obj.preguntas.length; i++) {
            console.log("analizando :"+ obj.preguntas[i].file)
            if (obj.preguntas[i].file !== "") {
                filePromises.push(new Promise((resolve, reject) => {
                    fs.readFile('uploads/' + obj.preguntas[i].file, (err, data) => {
                        if (err) reject(err);
                        console.log(data);
                        obj.preguntas[i].file = data
                        resolve();
                    });
                }));
            }
        }
        
        Promise.all(filePromises)
            .then(() => {
                res.status(200).send(obj);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Error al procesar archivos");
            });

        //res.status(200).send(obj);
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

app.delete('/eliminarCuestionario/:titulo', (req, res)=>{
    try{

        const titulo = req.params.titulo

        fs.unlink('cuestionarios/'+titulo+'.json', (err) => {
            if (err) {
                console.error('Error al eliminar el archivo:', err);
                res.status(500).send('Error interno del servidor al eliminar el archivo');
                return;
            }

            res.status(200).json({ message: 'Cuestionario eliminado' });
        })

    }catch(e){
        res.status(500).json({ message: e.message })
    }
})

app.get('/connectedUsers', (req, res) => {
    res.status(200).json(connectedUsers)
})

app.get('/isConnected', (req, res) => {
    res.status(200).json({ status: 'connected' })
})

app.get('/pruebaCuestionario/:titulo', async (req, res) => {
    
    const data = await obtenerFormulario(req.params.titulo)

    console.log(data.preguntas[0])

    res.status(200).send(data.preguntas[0])
})

app.get('/', (req, res) => {
    res.status(200).send('Servidor corriendo');
})


server.listen(3000, () => { //aqui cambia la ip de la maquina
    console.log('listening');

});

/////////////////FUNCIONES////////////////////

const obtenerFormulario = (titulo) => {  //funcion no endpoint para obtener un cuestionario
    return new Promise((resolve, reject) => {
        const cuestionarios = JSON.parse(fs.readFileSync('cuestionarios/' + titulo + '.json'));

        const obj = Object.assign({}, cuestionarios)

        const filePromises = [];

        for (let i = 0; i < obj.preguntas.length; i++) {
            //console.log("analizando :" + obj.preguntas[i].file)
            if (obj.preguntas[i].file !== "") {
                filePromises.push(new Promise((resolve, reject) => {
                    fs.readFile('uploads/' + obj.preguntas[i].file, (err, data) => {
                        if (err) reject(err);
                        //console.log(data);
                        obj.preguntas[i].file = data
                        resolve();
                    });
                }));
            }
        }

        Promise.all(filePromises)
            .then(() => {
                resolve(obj);
            })
            .catch((err) => {
                reject(err);
            });
    });
}