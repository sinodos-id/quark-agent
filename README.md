# 01-core

Es un componente que actúa como orquestador de mensajes en el cual se gestiona el flujo de trabajo dentro del entorno de SSI. 
Está diseñado para trabajar dentro de un mismo entorno de red sin medidas de seguridad adicionales.

## Tecnologías

La aplicación cuenta con las siguientes técnologias:

* Javascript
* Node.js
* Nest.js

## Install instructions

```
yarn clean 
yarn 
yarn build
yarn start
```

## Variables de Entorno

Variables de entorno de la aplicación

- TZ: America/Argentina/Buenos_Aires
- PORT: '8080'
- DWN_URL: https://url_dwn
- DWN_SCHEDULER_CRON_EXPRESSION: "*/10 * * * * *"
- RESOLVER_URL: https://url_resolver
- DID_CREATE_API_URL: https://url
- CHECK_EXPIRY_DATE_CRON_EXPRESSION: "0 0 * * *"
- ZONE_TIME_EXPRESSION: "America/Argentina/Buenos_Aires"
- VC_DATA_API_URL: https://url/vc-data
- PRESENTATION_CONTEXT_API_URL: https://url/presentation-context
- VAULT_ROLE_ID: 86b04ac0-ab9d-0d75-d412-418af2fd34a2
- VAULT_SECRET_ID: c24a29a3-e1a3-6d36-9221-d9d9b90b5902,
- VAULT_URL: https://url/v1
- DB_MONGO: mongodb_url
- VERIFIER_ENABLED: 'true'
- ISSUER_ENABLED: 'true'
- HOST: 'https://url-hosting'

## Logs

Los logs del proceso se encuentran disponibles:

### DEV o QA:

URL: https://kibana-openshift-logging.apps.ocp4-dev.gcba.gob.ar (autentica contra AD)

Deben crear el index-pattern: app-*

En la seccion Discover podran filtrar los logs por app clickeando sobre "Add a filter +"  y agregando los siguientes filtros:

kubernetes.namespace_name is {namespace}
Ej: kubernetes.namespace_name is identidad-soberana-qa
kubernetes.container_name is {componente}
Ej: kubernetes.container_name is message-manager

Namespaces:
- identidad-soberana-dev
- identidad-soberana-qa

Componente:
- message-manager

### HML o PRD:

URL: https://ops-view.gcba.gob.ar/ (autentica contra AD)

Entrar en Kibana, luego Discover, clickear sobre lemu-demolime-* y seleccionar el indice lemu-openshift-*
Podran filtrar los logs por app clickeando sobre "Add a filter +"  y agregando los siguientes filtros:

op_cluster is {cluster}
Ej: op_cluster is hml
op_namespace is {componente}
Ej: op_container is message-manager

Clusters
- hml
- prodint
- prodext (en su caso usarian prodext porque su web es publica .buenosaires)

Componente
- message-manager

## Requerimientos de red

La aplicación debe tener conectividad a internet y al componente DWN Client.

## Ruta de acceso

  Ambiente              URL
 - DEV      https://message-manager-dev.gcba.gob.ar
 - QA       https://message-manager-qa.gcba.gob.ar
 - HML      https://message-manager-hml.gcba.gob.ar
 - PROD     https://message-manager.buenosaires.gob.ar
 
