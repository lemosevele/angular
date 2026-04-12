# 🐳 OpenTelemetry Collector + Dynatrace - Setup de Logs

## 📋 Arquitetura (Simplificada)

```
Angular App (localhost:4200)
     ↓ HTTP + JSON (OTLP)
OpenTelemetry Collector (localhost:4318)
     ↓ Protobuf + gRPC
Dynatrace Cloud (wzs62299.live.dynatrace.com)
```

## 🚀 Como usar

### 1. **Inicie o Docker Compose**

```bash
cd /Users/evelelemos/Developer/projetos\ dev/angular/memoteca
docker-compose up -d
```

**Output esperado:**
```
Creating memoteca_otel-collector_1 ... done
```

### 2. **Verifique se o container está rodando**

```bash
docker-compose ps
```

Status esperado: **UP**

### 3. **Teste o health do Collector**

```bash
curl http://localhost:13133/healthz
```

Resposta esperada:
```
{"status":"Server listening"}
```

### 4. **Monitore os logs do Collector em tempo real**

```bash
docker-compose logs -f otel-collector
```

---

## 📱 Como usar no Angular

O serviço `OtelDynatraceLoggerService` já envia para o Collector local.

### Exemplo de uso:

```typescript
// No seu componente
import { OtelDynatraceLoggerService } from './otel-dynatrace-logger.service';

@Component(...)
export class MeuComponente {
  constructor(private otelLogger: OtelDynatraceLoggerService) {}

  ngOnInit() {
    this.otelLogger.info(
      'Componente carregado',
      'meu-componente',
      { userId: 123 }
    );
  }
}
```

### Métodos disponíveis:

- `.trace()` - mais detalhado
- `.debug()` - informações de debug
- `.info()` - informação geral
- `.warn()` - aviso
- `.error()` - erro
- `.fatal()` - crítico

---

## ✅ Testar End-to-End

1. **Inicie o Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Inicie o Angular:**
   ```bash
   npm start
   ```

3. **Abra em novo terminal para monitorar:**
   ```bash
   docker-compose logs -f otel-collector
   ```

4. **Navegue na aplicação** - crie pensamentos, clique em botões

5. **Procure nos logs do Collector:**
   ```
   "Received log records" ou "Logs successfully"
   ```

---

## 📊 Verificar no Dynatrace

1. Acesse: https://wzs62299.live.dynatrace.com
2. Vá para **Logs**
3. Procure por: `service.name:"Angular Memoteca App"`

---

## ⚙️ Configuração

### Arquivo padrão: `otel-collector-config.yaml`

Configurações importantes:

```yaml
# Tamanho do lote de logs (aumentar = menos requisições)
batch:
  send_batch_size: 100
  send_batch_max_size: 500

# Retry automático em caso de erro
retry_on_failure:
  enabled: true
```

---

## 🐛 Troubleshooting

### ❌ "Connection refused on localhost:4318"

```bash
# Verifique se Docker está rodando
docker ps

# Restart do container
docker-compose restart otel-collector
```

### ❌ Logs não aparecem no console

```bash
# Verifique os logs do Collector
docker-compose logs otel-collector

# Procure por erros de conexão
```

### ✅ Verificar saúde do Collector

```bash
curl -v http://localhost:13133/healthz
```

---

## 📞 Parar e limpar

```bash
# Parar containers
docker-compose down

# Parar e remover tudo
docker-compose down -v
```

---

## 📚 Links úteis

- [OpenTelemetry Collector Docs](https://opentelemetry.io/docs/collector/)
- [Dynatrace OTLP Integration](https://docs.dynatrace.com/docs/ingest-from/opentelemetry)
