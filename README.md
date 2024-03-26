# Aplicacion para cuestionarios tipo Kahoot de forma Offline

El proyecto fue elaborado para el cumplimiento del Servicio Social

## Desarrollador

Fermin Jimenez Garcia

[Portafolio](https://notausername0.github.io/Portafolio/)

Estudiante del IPN - Escuela Superior de Computo(ESCOM)

## Funcionamiento

El proyecto requiere esencialmente lo siguiente:

1. Tener el backend y el frontend
2. Conocer la ip del sistema donde se ejecutara el software
3. Una red LAN generada por una Laptop o una Smartphone

## ¿Como descargar?

1. Se necesita hacer es un `git clone` a la branch correspondiente en este repositorio.
2. Te quedaran 2 carpetas(front y back) en ambas se debe abrir el CMD o terminal y hacer el siguiente comando `npm i`
3. Para correr el front el cual sera la vista para el juego se necesita user el siguiente comando en la CMD o terminal `ng serve --host tu_ip`
4. Para correr el back el cual dara funcionamiento se necesita usar el siguiente comando en la CMD o terminal `node app.js`

## ¿Como funciona?

La apliaacion de Angular se conecta por una IP al servidor y el servidor crea automaticamente las carpetas necesarias para el registro de formularios y posteriormente el uso de los mismos, mientras que el front cuenta con 2 perfiles uno protegido por una contraseña mostrada en el manual de usuario y el documento tecnico.

En esta se especifica para que sirve cada boton y como socket.io interactua con todo el sistema para que el funcionamiento sea correcto
