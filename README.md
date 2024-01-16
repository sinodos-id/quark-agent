install instructions


```
yarn clean 
yarn 
yarn build
yarn start
```

env variables qa

```
name: TZ
value: America/Argentina/Buenos_Aires

name: PORT
value: '8080'

name: DWN_URL
value: https://dwn-qa.gcba.gob.ar

name: DWN_SCHEDULER_CRON_EXPRESSION
value: "*/10 * * * * *"

name: RESOLVER_URL
value: https://is-proxy-qa.gcba.gob.ar

name: DID_CREATE_API_URL
value: https://is-starknet-qa.gcba.gob.ar

name: CHECK_EXPIRY_DATE_CRON_EXPRESSION
value: "0 0 * * *"

name: ZONE_TIME_EXPRESSION
value: "America/Argentina/Buenos_Aires"

name: VC_DATA_API_URL
value: https://ssi-qa.gcba.gob.ar/vc-data

name: PRESENTATION_CONTEXT_API_URL
value: https://ssi-qa.gcba.gob.ar/presentation-context

name: VAULT_ROLE_ID
value: e68844a1-6758-dc78-5722-7a2985c4542d

name: VAULT_SECRET_ID
value: 4cbb39f6-3da5-7053-c0ad-c96e5c140fb4

name: VAULT_URL
value: http://vault-vault-qa.apps.ocp4-dev.gcba.gob.ar/v1

name: DB_MONGO
value: mongodb://10.9.11.141:27017/message-manager?authSource=admin

name: VERIFIER_ENABLED
value: 'true'

name: ISSUER_ENABLED
value: 'true'

name: HOST
value: 'https://message-manager-qa.gcba.gob.ar'

```

env variables hml

```
name: TZ
value: America/Argentina/Buenos_Aires

name: PORT
value: '8080'

name: DWN_URL
value: https://dwn-hml.gcba.gob.ar

name: DWN_SCHEDULER_CRON_EXPRESSION
value: "*/10 * * * * *"

name: RESOLVER_URL
value: https://is-proxy-hml.gcba.gob.ar

name: DID_CREATE_API_URL
value: https://is-starknet-hml.gcba.gob.ar

name: CHECK_EXPIRY_DATE_CRON_EXPRESSION
value: "0 0 * * *"

name: ZONE_TIME_EXPRESSION
value: "America/Argentina/Buenos_Aires"

name: VC_DATA_API_URL
value: https://ssi-hml.gcba.gob.ar/vc-data

name: PRESENTATION_CONTEXT_API_URL
value: https://ssi-hml.gcba.gob.ar/presentation-context

name: DB_MONGO
value: mongodb://10.9.11.141:27017/message-manager?authSource=admin

name: VERIFIER_ENABLED
value: 'true'

name: ISSUER_ENABLED
value: 'true'

name: HOST
value: 'https://message-manager-hml.gcba.gob.ar'

```
env variables prod

```
name: TZ
value: America/Argentina/Buenos_Aires

name: PORT
value: '8080'

name: DWN_URL
value: https://dwn-ssi.buenosaires.gob.ar

name: DWN_SCHEDULER_CRON_EXPRESSION
value: "*/10 * * * * *"

name: RESOLVER_URL
value: api proxy/

name: DID_CREATE_API_URL
value: api starknet

name: CHECK_EXPIRY_DATE_CRON_EXPRESSION
value: "0 0 * * *"

name: ZONE_TIME_EXPRESSION
value: "America/Argentina/Buenos_Aires"

name: VC_DATA_API_URL
value: https://ssi.buenosaires.gob.ar/vc-data

name: PRESENTATION_CONTEXT_API_URL
value: https://ssi.buenosaires.gob.ar/presentation-context

name: DB_MONGO
value: mongo

name: VERIFIER_ENABLED
value: 'true'

name: ISSUER_ENABLED
value: 'true'

name: HOST
value: 'https://message-manager.buenosaires.gob.ar'

```

