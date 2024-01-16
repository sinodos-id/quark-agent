# Backend Agent...
...
Seguir este tutorial para configurar la vault: https://developer.hashicorp.com/vault/tutorials/auth-methods/approle#step-1-enable-approle-auth-method

Policy:
```
path "secret/*" {
  capabilities = [ "create", "read", "update", "list", "delete" ]
}
```