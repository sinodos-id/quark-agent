## [Descripción](https://github.com/gcba/message-manager#descripci%C3%B3n)
## [Tecnologías](https://github.com/gcba/message-manager#tecnolog%C3%ADas)
## [Arquitectura](https://docs.quarkid.org/Arquitectura/) y [Documentación](https://docs.quarkid.org/Arquitectura/componentes/)
## Configuraciones:
### 1. [Configuraración de entorno local](https://github.com/gcba/message-manager#configuraci%C3%B3n-de-entorno-local)
### 2. [Variables de Entorno](https://github.com/gcba/message-manager#variables-de-entorno)
## [Licencia](https://github.com/gcba/message-manager#licencia)




-----------------------------------------------------------------------------


# Descripción

Es un componente que actúa como orquestador de mensajes en el cual se gestiona el flujo de trabajo dentro del entorno de SSI. 
Está diseñado para trabajar dentro de un mismo entorno de red sin medidas de seguridad adicionales.
Ademas esta pensado para interactuar con un micro servicio encargado de traducir las peticiones del front con este Backend Agent y también de forma inversa. Esta capa la llamamos SSI-Integration la cual en su capa de presentación expone una API REST con las principales funciones: 

1. Generación de invitaciones QR
2. Generación de invitaciones DeepLink
3. Almacenamiento de DIDs en la base de datos del cliente

## Tecnologías

La aplicación cuenta con las siguientes técnologias:

* Javascript
* Node.js
* Nest.js
  
## Arquitectura
[Diagrama](https://docs.quarkid.org/Arquitectura/)

## Documentación
[Link](https://docs.quarkid.org/Arquitectura/componentes/)

## Configuración de entorno local

Clonar el repositorio

- Abrir el proyecto con el editor seleccionado
- Abrir una terminal y ejecutar:

```bash
- cd source
- yarn
- yarn build
- yarn start
```

Al instalar las dependecias con el comando "yarn" puede darnos error la libreria "@mattrglobal/node-bbs-signatures", opcional ignorar el mismo.

## Pasos para instalar el componente en un servidor

1. Contar con Linux vacío. 
2. Instalar el componente y sus imágenes, se encuentran [Docker](https://hub.docker.com/r/quarkid/message-manager)

Para instalar un componente desde Docker Hub en tu servidor, sigue estos pasos:

1. Conéctate al servidor.

2. Instala Docker en el servidor:
Si aún no tienes Docker instalado en tu servidor, sigue las instrucciones para instalar Docker en tu sistema operativo. Puedes encontrar guías detalladas en la documentación oficial de Docker.

3. Descarga Docker.

4. [Generar vault](https://developer.hashicorp.com/vault/tutorials/auth-methods/approle#step-1-enable-approle-auth-method)

Policy:
```
path "secret/*" {
  capabilities = [ "create", "read", "update", "list", "delete" ]
}
```
5. Ejecutar:
```
cd source
```
6. Ejecutar:
```
docker compose up
```

## Variables de Entorno
## Generales

N/A 

## Logs

N/A

## Requerimientos de red

La aplicación debe tener conectividad a internet y al componente DWN Client.

## Ruta de acceso

N/A

## Licencia
Derechos de autor © 2023 Gobierno de la Ciudad de Buenos Aires

Licenciado bajo la Licencia Apache, Versión 2.0 (la "Licencia");
usted no puede utilizar este archivo excepto en cumplimiento con la Licencia.
Puede obtener una copia de la Licencia en
http://www.apache.org/licenses/LICENSE-2.0.
A menos que lo requiera la ley aplicable o se acuerde por escrito, el software
distribuido bajo la Licencia se distribuye "TAL CUAL",
SIN GARANTÍAS O CONDICIONES DE NINGÚN TIPO, ya sean expresas o implícitas.
Consulte la Licencia para el idioma específico que rige los permisos y
limitaciones bajo la Licencia.
