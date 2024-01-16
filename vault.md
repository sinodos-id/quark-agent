# Vault config..

[Tutorial para el setup](https://developer.hashicorp.com/vault/tutorials/auth-methods/approle#step-1-enable-approle-auth-method)
.
Se debe seguir el tutorial, ya sea por Web UI o por CLI, pero utilizando la siguiente policy en lugar de la provista en el ejemplo:

#### Policy:
```
path "secret/*" {
  capabilities = [ "create", "read", "update", "list", "delete" ]
}
```
....
Los nombres del rol y la policy pueden ser los que se deseen, pero tener en cuenta estos nombres al ejecutar los comandos (en el ejemplo se usa el nombre `jenkins` para ambos)


