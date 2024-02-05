
# Upgrade de v2.0.3-RC2 => v2.0.4-RC2

## DB Upgrade

## Realizar build y deploy desde tags

- message-manager/tags: 2.0.4-RC2

### Despliegue (OC)

Acciones
- agregar volumen persistente en el deployment en el mountpath : /opt/app-root/src/storage
- En el archivo deployment.yaml modificar el volumeMounts con lo siguiente mountPath: /opt/app-root/src/enviroments/config.json subPath: config.json
- cambiar variable de entorno de qa : 
















