# CAMBIOS

- Fix en el guardado del DID 
- Inclusion del filesystem para las variables de entorno dentro del dist.

# Acciones
- agregar volumen persistente en el deployment en el mountpath : /opt/app-root/src/storage
- En el archivo deployment.yaml modificar el volumeMounts con lo siguiente mountPath: /opt/app-root/src/enviroments/config.json subPath: config.json
- cambiar variable de entorno de qa : 
```
"VAULT_ROLE_ID":"86b04ac0-ab9d-0d75-d412-418af2fd34a2" 
"VAULT_SECRET_ID":"c24a29a3-e1a3-6d36-9221-d9d9b90b5902",
```
# QA
```
{
    "PORT":"8080",
    "WEBSOCKET_ENDPOINT_ID": "MessagingWebSocket",
    "DID_METHOD":"did:quarkid:zksync",
    "WEBSOCKET_ENDPOINT_URL":"https://messagemanager-qa.gcba.gob.ar",
    "SSI_INTEGRATION_API_URL": "https://ssi-qa.gcba.gob.ar",
    "MONGO_URI":"url to db",
    "MODENA_URL":"https://is-apiproxy-qa.gcba.gob.ar",
    "VAULT_URL":"http://vault-vault-qa.apps.ocp4-dev.gcba.gob.ar/v1" ,
    "VAULT_ROLE_ID":"ID QA",
    "VAULT_SECRET_ID":"SECRET QA",
    "DWN_URL":"https://dwn-qa.gcba.gob.ar",
    "TOKEN_SECRET" :"a2Fpem9rdcWNIG5pIG9yZSB3YSBuYXJ1" 
    }
```

# HML
```
{
    "PORT":"8080",
    "WEBSOCKET_ENDPOINT_ID": "MessagingWebSocket",
    "DID_METHOD":"did:quarkid:zksync",
    "WEBSOCKET_ENDPOINT_URL":"https://messagemanager-hml.gcba.gob.ar",
    "SSI_INTEGRATION_API_URL": "https://quarkid-ssi-hml.gcba.gob.ar",
    "MONGO_URI":"URL TO DB",
    "MODENA_URL":"https://is-apiproxy-hml.gcba.gob.ar",
    "VAULT_URL":"URL VAULT" ,
    "VAULT_ROLE_ID":"ID HML",
    "VAULT_SECRET_ID":"SECRET HML",
    "DWN_URL":"https://quarkid-dwn-hml.gcba.gob.ar",
    "TOKEN_SECRET" :"a2Fpem9rdcWNIG5pIG9yZSB3YSBuYXJ1" 
    }
```

# PROD
```
{
    "PORT":"8080",
    "WEBSOCKET_ENDPOINT_ID": "MessagingWebSocket",
    "DID_METHOD":"did:quarkid:zksync",
    "WEBSOCKET_ENDPOINT_URL":"MESSAGE MANAGER URL",
    "SSI_INTEGRATION_API_URL": "SSI INTEGRATION URL",
    "MONGO_URI":"URL TO DB",
    "MODENA_URL":"API PROXY URL",
    "VAULT_URL":"VAULT URL" ,
    "VAULT_ROLE_ID":"VAULT ID",
    "VAULT_SECRET_ID":"VAULT SECRET",
    "DWN_URL":"DWN URL",
    "TOKEN_SECRET" :"a2Fpem9rdcWNIG5pIG9yZSB3YSBuYXJ1" 
    }
```















