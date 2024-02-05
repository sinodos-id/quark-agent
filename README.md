## Descripción

Es un componente que actúa como orquestador de mensajes en el cual se gestiona el flujo de trabajo dentro del entorno de SSI. 
Está diseñado para trabajar dentro de un mismo entorno de red sin medidas de seguridad adicionales.

## Tecnologías

- Node.js 14.19.1
- Nest.js 8.0.0
- Typescript 4.*

## Diagrama

## Licencia

Copyright [2023] [Gobierno de la Ciudad de Buenos Aires]

Licenciado bajo la Licencia Apache, Versión 2.0 (la "Licencia");
no puede utilizar este archivo excepto de conformidad con la Licencia.
Puede obtener una copia de la Licencia en

[LICENSE](http://www.apache.org/licenses/LICENSE-2.0)

A menos que lo exija la ley aplicable o se acuerde por escrito, el software
distribuido bajo la Licencia se distribuye "TAL CUAL",
SIN GARANTÍAS NI CONDICIONES DE NINGÚN TIPO, ya sean expresas o implícitas.
Consulte la Licencia para conocer el idioma específico que rige los permisos y
limitaciones bajo la Licencia.

## Variables de Entorno

### Generales

QA
- TZ: America/Argentina/Buenos_Aires
- PORT: '8080'
- DWN_URL: https://dwn-qa.gcba.gob.ar
- DWN_SCHEDULER_CRON_EXPRESSION: "*/10 * * * * *"
- RESOLVER_URL: https://is-proxy-qa.gcba.gob.ar
- DID_CREATE_API_URL: https://is-starknet-qa.gcba.gob.ar
- CHECK_EXPIRY_DATE_CRON_EXPRESSION: "0 0 * * *"
- ZONE_TIME_EXPRESSION: "America/Argentina/Buenos_Aires"
- VC_DATA_API_URL: https://ssi-qa.gcba.gob.ar/vc-data
- PRESENTATION_CONTEXT_API_URL: https://ssi-qa.gcba.gob.ar/presentation-context
- VAULT_ROLE_ID: 86b04ac0-ab9d-0d75-d412-418af2fd34a2 
- VAULT_SECRET_ID: c24a29a3-e1a3-6d36-9221-d9d9b90b5902,
- VAULT_URL: http://vault-vault-qa.apps.ocp4-dev.gcba.gob.ar/v1
- DB_MONGO: mongodb://10.9.11.141:27017/message-manager?authSource=admin
- VERIFIER_ENABLED: 'true'
- ISSUER_ENABLED: 'true'
- HOST: 'https://message-manager-qa.gcba.gob.ar'

HML
- TZ: America/Argentina/Buenos_Aires
- PORT: '8080'
- DWN_URL: https://dwn-hml.gcba.gob.ar
- DWN_SCHEDULER_CRON_EXPRESSION: "*/10 * * * * *"
- RESOLVER_URL: https://is-proxy-hml.gcba.gob.ar
- DID_CREATE_API_URL: https://is-starknet-hml.gcba.gob.ar
- CHECK_EXPIRY_DATE_CRON_EXPRESSION: "0 0 * * *"
- ZONE_TIME_EXPRESSION: "America/Argentina/Buenos_Aires"
- VC_DATA_API_URL: https://ssi-hml.gcba.gob.ar/vc-data
- PRESENTATION_CONTEXT_API_URL: https://ssi-hml.gcba.gob.ar/presentation-context
- DB_MONGO: mongodb://10.9.11.141:27017/message-manager?authSource=admin
- VERIFIER_ENABLED: 'true'
- ISSUER_ENABLED: 'true'
- HOST: 'https://message-manager-hml.gcba.gob.ar'

## Instalación

```bash
yarn clean 
yarn 
yarn build
yarn start
```
## Healthcheck

Para comprobar la salud del servicio basta con navegar la url base con una / al final, retornara un Status 200, con la info correspondiente.

[Postman Collection]()

## Requerimientos de red

La aplicación debe tener conectividad a internet y al componente DWN Client.

## Ruta de acceso

 - [DEV](https://message-manager-dev.gcba.gob.ar)
 - [QA](https://message-manager-qa.gcba.gob.ar)
 - [HML](https://message-manager-hml.gcba.gob.ar)
 - [PROD](https://message-manager.buenosaires.gob.ar)
 
